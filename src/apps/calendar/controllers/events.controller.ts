import { z } from "zod";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import ClientError from "@utils/ClientError";
import { zodHandler } from "@utils/asyncWrapper";
import { getAPIKey } from "@utils/getAPIKey";

import * as EventsService from "../services/events.service";
import { CalendarEventSchema } from "../typescript/calendar_interfaces";

export const getEventsByDateRange = zodHandler(
  {
    query: z.object({
      start: z.string(),
      end: z.string(),
    }),
    response: z.array(WithPBSchema(CalendarEventSchema)),
  },
  async ({ pb, query }) =>
    await EventsService.getEventsByDateRange(pb, query.start, query.end),
);

export const getEventById = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: WithPBSchema(CalendarEventSchema),
  },
  async ({ pb, params }) => await EventsService.getEventById(pb, params.id),
  {
    existenceCheck: {
      params: {
        id: "calendar_events",
      },
    },
  },
);

export const getEventsToday = zodHandler(
  {
    response: z.array(WithPBSchema(CalendarEventSchema)),
  },
  async ({ pb }) => await EventsService.getTodayEvents(pb),
);

export const createEvent = zodHandler(
  {
    body: CalendarEventSchema.omit({
      is_strikethrough: true,
      exceptions: true,
    }),
    response: WithPBSchema(CalendarEventSchema),
  },
  async ({ pb, body }) => {
    if (body.type === "recurring" && !body.recurring_rrule) {
      throw new ClientError("Recurring events must have a recurring rule");
    }

    return await EventsService.createEvent(pb, body);
  },
  {
    statusCode: 201,
  },
);

export const scanImage = zodHandler(
  {
    response: CalendarEventSchema.partial(),
  },
  async ({ pb, req }) => {
    const { file } = req;

    if (!file) {
      throw new ClientError("No file uploaded");
    }

    const apiKey = await getAPIKey("openai", pb);

    if (!apiKey) {
      throw new ClientError("No API key found");
    }

    const eventData = await EventsService.scanImage(pb, file.path, apiKey);

    if (!eventData) {
      throw new Error("Failed to scan image");
    }

    return eventData;
  },
);

export const updateEvent = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    body: CalendarEventSchema.partial().omit({
      is_strikethrough: true,
      exceptions: true,
    }),
    response: WithPBSchema(CalendarEventSchema),
  },
  async ({ pb, params, body }) =>
    await EventsService.updateEvent(pb, params.id.split("-")[0], body),
  {
    existenceCheck: {
      params: {
        id: "calendar_events",
      },
    },
  },
);

export const deleteEvent = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  },
  async ({ pb, params }) => await EventsService.deleteEvent(pb, params.id),
  {
    existenceCheck: {
      params: {
        id: "calendar_events",
      },
    },
    statusCode: 204,
  },
);

export const addException = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    body: z.object({
      date: z.string(),
    }),
    response: z.boolean(),
  },
  async ({ pb, params, body }) =>
    await EventsService.addException(pb, params.id, body.date),
  {
    existenceCheck: {
      params: {
        id: "calendar_events",
      },
    },
  },
);
