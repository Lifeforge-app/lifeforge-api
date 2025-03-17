import { Request, Response } from "express";
import { BaseResponse } from "../../../interfaces/base_response";
import { ICalendarEvent } from "../../../interfaces/calendar_interfaces";
import { checkExistence } from "../../../utils/PBRecordValidator";
import { serverError, successWithBaseResponse } from "../../../utils/response";
import * as EventsService from "../services/eventsService";

export const getEventsByDateRange = async (
  req: Request<{}, {}, {}, { start: string; end: string }>,
  res: Response<BaseResponse<ICalendarEvent[]>>,
) => {
  const { pb } = req;
  const { start, end } = req.query;

  try {
    const events = await EventsService.getEventsByDateRange(pb, start, end);

    successWithBaseResponse(res, events);
  } catch (error) {
    console.log(error);
    serverError(res, "Failed to fetch calendar events");
  }
};

export const getEventsToday = async (
  req: Request,
  res: Response<BaseResponse<ICalendarEvent[]>>,
) => {
  const { pb } = req;

  try {
    const events = await EventsService.getTodayEvents(pb);

    successWithBaseResponse(res, events);
  } catch (error) {
    serverError(res, "Failed to fetch calendar events");
  }
};

export const createEvent = async (
  req: Request,
  res: Response<BaseResponse<ICalendarEvent>>,
) => {
  const { pb } = req;
  const eventData = req.body;

  try {
    const event = await EventsService.createEvent(pb, eventData);
    successWithBaseResponse(res, event, 201);
  } catch (error) {
    serverError(res, "Failed to create calendar event");
  }
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

  try {
    const event = await EventsService.updateEvent(pb, id, eventData);
    successWithBaseResponse(res, event);
  } catch (error) {
    serverError(res, "Failed to update calendar event");
  }
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

  try {
    const isDeleted = await EventsService.deleteEvent(pb, id);

    if (isDeleted) {
      successWithBaseResponse(res, undefined, 204);
    } else {
      serverError(res, "Failed to delete calendar event");
    }
  } catch (error) {
    serverError(res, "Failed to delete calendar event");
  }
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

  try {
    const event = await EventsService.getEventById(pb, id);
    successWithBaseResponse(res, event);
  } catch (error) {
    serverError(res, "Failed to fetch calendar event");
  }
};
