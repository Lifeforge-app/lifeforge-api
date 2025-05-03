import { getAPIKey } from "@utils/getAPIKey";
import { checkExistence } from "@utils/PBRecordValidator";
import { clientError, successWithBaseResponse } from "@utils/response";
import { Request, Response } from "express";
import { BaseResponse } from "../../../core/typescript/base_response";
import * as EventsService from "../services/events.service";
import { ICalendarEvent } from "../typescript/calendar_interfaces";

export const getEventsByDateRange = async (
  req: Request<{}, {}, {}, { start: string; end: string }>,
  res: Response<BaseResponse<ICalendarEvent[]>>,
) => {
  const { pb } = req;
  const { start, end } = req.query;

  const events = await EventsService.getEventsByDateRange(pb, start, end);
  successWithBaseResponse(res, events);
};

export const getEventsToday = async (
  req: Request,
  res: Response<BaseResponse<ICalendarEvent[]>>,
) => {
  const { pb } = req;

  const events = await EventsService.getTodayEvents(pb);
  successWithBaseResponse(res, events);
};

export const createEvent = async (
  req: Request,
  res: Response<BaseResponse<ICalendarEvent>>,
) => {
  const { pb } = req;
  const eventData = req.body;

  if (eventData.type === "recurring" && !eventData.recurring_rrule) {
    return clientError(res, "Recurring events must have a recurring rule");
  }

  const event = await EventsService.createEvent(pb, eventData);
  successWithBaseResponse(res, event, 201);
};

export const scanImage = async (
  req: Request,
  res: Response<BaseResponse<Partial<ICalendarEvent>>>,
) => {
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
};

export const updateEvent = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<ICalendarEvent>>,
) => {
  const { pb } = req;
  const { id } = req.params;
  const eventData = req.body;

  const finalId = id.split("-")[0];

  if (eventData.type === "recurring" && !eventData.recurring_rrule) {
    return clientError(res, "Recurring events must have a recurring rule");
  }

  if (!(await checkExistence(req, res, "calendar_events", finalId))) {
    return;
  }

  const event = await EventsService.updateEvent(pb, finalId, eventData);
  successWithBaseResponse(res, event);
};

export const deleteEvent = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<undefined>>,
) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "calendar_events", id))) {
    return;
  }

  await EventsService.deleteEvent(pb, id);
  successWithBaseResponse(res, undefined, 204);
};

export const getEventById = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<ICalendarEvent>>,
) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "calendar_events", id))) {
    return;
  }

  const event = await EventsService.getEventById(pb, id);
  successWithBaseResponse(res, event);
};

export const addException = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<undefined>>,
) => {
  const { pb } = req;
  const { id } = req.params;
  const { date } = req.body;

  if (!(await checkExistence(req, res, "calendar_events", id))) {
    return;
  }

  await EventsService.addException(pb, id, date);
  successWithBaseResponse(res, undefined, 204);
};
