import { z } from "zod";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import { checkExistence } from "@utils/PBRecordValidator";
import { zodHandler } from "@utils/asyncWrapper";
import { getAPIKey } from "@utils/getAPIKey";
import { clientError, successWithBaseResponse } from "@utils/response";

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
  async (req, res) => {
    const { pb } = req;
    const { start, end } = req.query;

    const events = await EventsService.getEventsByDateRange(pb, start, end);

    successWithBaseResponse(res, events);
  },
);

export const getEventById = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: WithPBSchema(CalendarEventSchema),
  },
  async (req, res) => {
    const { pb } = req;
    const { id } = req.params;

    if (!(await checkExistence(req, res, "calendar_events", id))) {
      return;
    }

    const event = await EventsService.getEventById(pb, id);

    successWithBaseResponse(res, event);
  },
);

export const getEventsToday = zodHandler(
  {
    response: z.array(WithPBSchema(CalendarEventSchema)),
  },
  async (req, res) => {
    const { pb } = req;

    const events = await EventsService.getTodayEvents(pb);

    successWithBaseResponse(res, events);
  },
);

export const createEvent = zodHandler(
  {
    body: CalendarEventSchema.pick({
      title: true,
      category: true,
      start: true,
      end: true,
      type: true,
      recurring_rrule: true,
      recurring_duration_amount: true,
      recurring_duration_unit: true,
    }),
    response: WithPBSchema(CalendarEventSchema),
  },
  async (req, res) => {
    const { pb } = req;
    const eventData = req.body;

    if (eventData.type === "recurring" && !eventData.recurring_rrule) {
      return clientError(res, "Recurring events must have a recurring rule");
    }

    const event = await EventsService.createEvent(pb, eventData);

    successWithBaseResponse(res, event, 201);
  },
);

export const scanImage = zodHandler(
  {
    response: CalendarEventSchema.partial(),
  },
  async (req, res) => {
    const { pb } = req;
    const { file } = req;

    if (!file) {
      return clientError(res, "No file uploaded");
    }

    const apiKey = await getAPIKey("openai", pb);

    if (!apiKey) {
      return clientError(res, "No API key found");
    }

    const eventData = await EventsService.scanImage(pb, file.path, apiKey);

    if (!eventData) {
      return clientError(res, "Failed to scan image");
    }

    successWithBaseResponse(res, eventData);
  },
);

export const updateEvent = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    body: CalendarEventSchema.pick({
      title: true,
      category: true,
      start: true,
      end: true,
    }),
    response: WithPBSchema(CalendarEventSchema),
  },
  async (req, res) => {
    const { pb } = req;
    const { id } = req.params;
    const eventData = req.body;

    const finalId = id.split("-")[0];

    if (!(await checkExistence(req, res, "calendar_events", finalId))) {
      return;
    }

    const event = await EventsService.updateEvent(pb, finalId, eventData);

    successWithBaseResponse(res, event);
  },
);

export const deleteEvent = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  },
  async (req, res) => {
    const { pb } = req;
    const { id } = req.params;

    if (!(await checkExistence(req, res, "calendar_events", id))) {
      return;
    }

    await EventsService.deleteEvent(pb, id);

    successWithBaseResponse(res, undefined, 204);
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
    response: z.void(),
  },
  async (req, res) => {
    const { pb } = req;
    const { id } = req.params;
    const { date } = req.body;

    if (!(await checkExistence(req, res, "calendar_events", id))) {
      return;
    }

    await EventsService.addException(pb, id, date);

    successWithBaseResponse(res, undefined, 204);
  },
);
