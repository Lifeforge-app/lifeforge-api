import { BaseResponse } from "@typescript/base_response";
import { checkExistence } from "@utils/PBRecordValidator";
import { clientError, successWithBaseResponse } from "@utils/response";
import { Request, Response } from "express";
import * as CalendarsService from "../services/calendars.service";
import { ICalendarCalendar } from "../typescript/calendar_interfaces";

export const getAllCalendars = async (
  req: Request,
  res: Response<BaseResponse<ICalendarCalendar[]>>,
) => {
  const { pb } = req;

  const calendars = await CalendarsService.getAllCalendars(pb);
  successWithBaseResponse(res, calendars);
};

export const createCalendar = async (
  req: Request,
  res: Response<BaseResponse<ICalendarCalendar>>,
) => {
  const { pb } = req;
  const calendarData = req.body;

  if (
    await pb
      .collection("calendar_calendars")
      .getFirstListItem(`name="${calendarData.name}"`)
      .catch(() => null)
  ) {
    return clientError(res, "Calendar with this name already exists");
  }

  const calendar = await CalendarsService.createCalendar(pb, calendarData);
  successWithBaseResponse(res, calendar, 201);
};

export const updateCalendar = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<ICalendarCalendar>>,
) => {
  const { pb } = req;
  const { id } = req.params;
  const calendarData = req.body;

  if (!(await checkExistence(req, res, "calendar_calendars", id))) {
    return;
  }

  if (
    await pb
      .collection("calendar_calendars")
      .getFirstListItem(`name="${calendarData.name}" && id != "${id}"`)
      .catch(() => null)
  ) {
    return clientError(res, "Calendar with this name already exists");
  }

  const calendar = await CalendarsService.updateCalendar(pb, id, calendarData);
  successWithBaseResponse(res, calendar);
};

export const deleteCalendar = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<undefined>>,
) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "calendar_calendars", id))) {
    return;
  }

  await CalendarsService.deleteCalendar(pb, id);
  successWithBaseResponse(res, undefined, 204);
};

export const getCalendarById = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<ICalendarCalendar>>,
) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "calendar_calendars", id))) {
    return;
  }

  const calendar = await CalendarsService.getCalendarById(pb, id);
  successWithBaseResponse(res, calendar);
};
