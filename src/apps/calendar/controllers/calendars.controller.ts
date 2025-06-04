import { z } from "zod";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import ClientError from "@utils/ClientError";
import { zodHandler } from "@utils/asyncWrapper";

import * as CalendarsService from "../services/calendars.service";
import { CalendarCalendarSchema } from "../typescript/calendar_interfaces";

export const getAllCalendars = zodHandler(
  {
    response: z.array(WithPBSchema(CalendarCalendarSchema)),
  },
  async ({ pb }) => await CalendarsService.getAllCalendars(pb),
);

export const getCalendarById = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: WithPBSchema(CalendarCalendarSchema),
  },
  async ({ pb, params: { id } }) =>
    await CalendarsService.getCalendarById(pb, id),
  {
    existenceCheck: {
      params: {
        id: "calendar_calendars",
      },
    },
  },
);

export const createCalendar = zodHandler(
  {
    body: CalendarCalendarSchema,
    response: WithPBSchema(CalendarCalendarSchema),
  },
  async ({ pb, body }) => {
    if (
      await pb
        .collection("calendar_calendars")
        .getFirstListItem(`name="${body.name}"`)
        .catch(() => null)
    ) {
      throw new ClientError("Calendar with this name already exists");
    }

    return await CalendarsService.createCalendar(pb, body);
  },
  {
    statusCode: 201,
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
  async ({ pb, params: { id }, body }) => {
    if (
      await pb
        .collection("calendar_calendars")
        .getFirstListItem(`name="${body.name}" && id != "${id}"`)
        .catch(() => null)
    ) {
      throw new ClientError("Calendar with this name already exists");
    }

    return await CalendarsService.updateCalendar(pb, id, body);
  },
  {
    existenceCheck: {
      params: {
        id: "calendar_calendars",
      },
    },
  },
);

export const deleteCalendar = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  },
  async ({ pb, params: { id } }) =>
    await CalendarsService.deleteCalendar(pb, id),
  {
    existenceCheck: {
      params: {
        id: "calendar_calendars",
      },
    },
    statusCode: 204,
  },
);
