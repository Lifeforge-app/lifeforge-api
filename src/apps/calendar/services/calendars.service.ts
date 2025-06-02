import PocketBase from "pocketbase";

import { WithPB } from "@typescript/pocketbase_interfaces";

import { ICalendarCalendar } from "../typescript/calendar_interfaces";

export const getAllCalendars = (
  pb: PocketBase,
): Promise<WithPB<ICalendarCalendar>[]> =>
  pb.collection("calendar_calendars").getFullList<WithPB<ICalendarCalendar>>({
    sort: "+name",
  });

export const createCalendar = (
  pb: PocketBase,
  calendarData: ICalendarCalendar,
): Promise<WithPB<ICalendarCalendar>> =>
  pb
    .collection("calendar_calendars")
    .create<WithPB<ICalendarCalendar>>(calendarData);

export const updateCalendar = (
  pb: PocketBase,
  id: string,
  calendarData: ICalendarCalendar,
): Promise<WithPB<ICalendarCalendar>> =>
  pb
    .collection("calendar_calendars")
    .update<WithPB<ICalendarCalendar>>(id, calendarData);

export const deleteCalendar = (pb: PocketBase, id: string) =>
  pb.collection("calendar_calendars").delete(id);

export const getCalendarById = (
  pb: PocketBase,
  id: string,
): Promise<WithPB<ICalendarCalendar>> =>
  pb.collection("calendar_calendars").getOne<WithPB<ICalendarCalendar>>(id);
