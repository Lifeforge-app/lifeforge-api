import { checkExistence } from "@utils/PBRecordValidator";
import { successWithBaseResponse } from "@utils/response";
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

  const event = await EventsService.createEvent(pb, eventData);
  successWithBaseResponse(res, event, 201);
};

export const updateEvent = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<ICalendarEvent>>,
) => {
  const { pb } = req;
  const { id } = req.params;
  const eventData = req.body;

  if (!(await checkExistence(req, res, "calendar_events", id))) {
    return;
  }

  const event = await EventsService.updateEvent(pb, id, eventData);
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
