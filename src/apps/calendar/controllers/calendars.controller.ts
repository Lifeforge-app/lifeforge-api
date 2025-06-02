import { Request, Response } from "express";
import { z } from "zod";

import { BaseResponse } from "@typescript/base_response";
import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import { checkExistence } from "@utils/PBRecordValidator";
import { zodHandler } from "@utils/asyncWrapper";
import { clientError, successWithBaseResponse } from "@utils/response";

import * as CalendarsService from "../services/calendars.service";
import { CalendarCalendarSchema } from "../typescript/calendar_interfaces";

export const getAllCalendars = zodHandler(
  {
    response: z.array(WithPBSchema(CalendarCalendarSchema)),
  },
  async (req, res) => {
    const { pb } = req;

    const calendars = await CalendarsService.getAllCalendars(pb);

    successWithBaseResponse(res, calendars);
  },
);

export const getCalendarById = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: WithPBSchema(CalendarCalendarSchema),
  },
  async (req, res) => {
    const { pb } = req;
    const { id } = req.params;

    if (!(await checkExistence(req, res, "calendar_calendars", id))) {
      return;
    }

    const calendar = await CalendarsService.getCalendarById(pb, id);

    successWithBaseResponse(res, calendar);
  },
);

export const createCalendar = zodHandler(
  {
    body: CalendarCalendarSchema,
    response: WithPBSchema(CalendarCalendarSchema),
  },
  async (req, res) => {
    const { pb } = req;

    if (
      await pb
        .collection("calendar_calendars")
        .getFirstListItem(`name="${req.body.name}"`)
        .catch(() => null)
    ) {
      return clientError(res, "Calendar with this name already exists");
    }

    const calendar = await CalendarsService.createCalendar(pb, req.body);

    successWithBaseResponse(res, calendar, 201);
  },
);

export const updateCalendar = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    body: CalendarCalendarSchema,
    response: WithPBSchema(CalendarCalendarSchema),
  },
  async (req, res) => {
    const { pb } = req;
    const { id } = req.params;

    if (!(await checkExistence(req, res, "calendar_calendars", id))) {
      return;
    }

    if (
      await pb
        .collection("calendar_calendars")
        .getFirstListItem(`name="${req.body.name}" && id != "${id}"`)
        .catch(() => null)
    ) {
      return clientError(res, "Calendar with this name already exists");
    }

    const calendar = await CalendarsService.updateCalendar(pb, id, req.body);

    successWithBaseResponse(res, calendar);
  },
);

export const deleteCalendar = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  },
  async (req, res) => {
    const { pb } = req;
    const { id } = req.params;

    if (!(await checkExistence(req, res, "calendar_calendars", id))) {
      return;
    }

    await CalendarsService.deleteCalendar(pb, id);

    successWithBaseResponse(res, undefined, 204);
  },
);
