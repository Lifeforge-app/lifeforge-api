import PocketBase from "pocketbase";

import { WithoutPBDefault } from "@typescript/pocketbase_interfaces";

import { ICalendarCalendar } from "../typescript/calendar_interfaces";

export const getAllCalendars = async (pb: PocketBase): Promise => {
  return await pb
    .collection("calendar_calendars")
    .getFullList<ICalendarCalendar>({
      sort: "+name",
    });
};

export const createCalendar = async (
  pb: PocketBase,
  calendarData: WithoutPBDefault,
): Promise => {
  const createdEntry = await pb
    .collection("calendar_calendars")
    .create<ICalendarCalendar>(calendarData);

  return createdEntry;
};

export const updateCalendar = async (
  pb: PocketBase,
  id: string,
  calendarData: WithoutPBDefault,
): Promise => {
  const updatedEntry = await pb
    .collection("calendar_calendars")
    .update<ICalendarCalendar>(id, calendarData);

  return updatedEntry;
};

export const deleteCalendar = async (pb: PocketBase, id: string): Promise => {
  return await pb.collection("calendar_calendars").delete(id);
};

export const getCalendarById = async (pb: PocketBase, id: string): Promise => {
  return await pb
    .collection("calendar_calendars")
    .getOne<ICalendarCalendar>(id);
};
