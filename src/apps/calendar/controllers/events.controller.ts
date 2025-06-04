import { z } from "zod/v4";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import ClientError from "@utils/ClientError";
import { getAPIKey } from "@utils/getAPIKey";
import { forgeController } from "@utils/zodifiedHandler";

import * as EventsService from "../services/events.service";
import { CalendarEventSchema } from "../typescript/calendar_interfaces";

export const getEventsByDateRange = forgeController(
  {
    query: z.object({
      start: z.string(),
      end: z.string(),
    }),
    response: z.array(WithPBSchema(CalendarEventSchema)),
  },
  async ({ pb, query: { start, end } }) =>
    await EventsService.getEventsByDateRange(pb, start, end),
);

export const getEventById = forgeController(
  {
    params: z.object({
      id: z.string(),
    }),
    response: WithPBSchema(CalendarEventSchema),
  },
  async ({ pb, params: { id } }) => await EventsService.getEventById(pb, id),
  {
    existenceCheck: {
      params: {
        id: "calendar_events",
      },
    },
  },
);

export const getEventsToday = forgeController(
  {
    response: z.array(WithPBSchema(CalendarEventSchema)),
  },
  async ({ pb }) => await EventsService.getTodayEvents(pb),
);

export const createEvent = forgeController(
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

export const scanImage = forgeController(
  {
    response: CalendarEventSchema.partial(),
  },
  async ({ pb, req }) => {
    const { file } = req;

    if (!file) {
      throw new ClientError("No file uploaded");
    }

    const eventData = await EventsService.scanImage(pb, file.path);

    if (!eventData) {
      throw new Error("Failed to scan image");
    }

    return eventData;
  },
);

export const updateEvent = forgeController(
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
  async ({ pb, params: { id }, body }) =>
    await EventsService.updateEvent(pb, id.split("-")[0], body),
  {
    existenceCheck: {
      params: {
        id: "calendar_events",
      },
    },
  },
);

export const deleteEvent = forgeController(
  {
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  },
  async ({ pb, params: { id } }) => await EventsService.deleteEvent(pb, id),
  {
    existenceCheck: {
      params: {
        id: "calendar_events",
      },
    },
    statusCode: 204,
  },
);

export const addException = forgeController(
  {
    params: z.object({
      id: z.string(),
    }),
    body: z.object({
      date: z.string(),
    }),
    response: z.boolean(),
  },
  async ({ pb, params: { id }, body: { date } }) =>
    await EventsService.addException(pb, id, date),
  {
    existenceCheck: {
      params: {
        id: "calendar_events",
      },
    },
  },
);
