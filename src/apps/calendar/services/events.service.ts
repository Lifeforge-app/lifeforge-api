import moment from "moment";
import PocketBase from "pocketbase";
import { WithoutPBDefault } from "../../../core/typescript/pocketbase_interfaces";
import { ICalendarEvent } from "../typescript/calendar_interfaces";

export const getEventsByDateRange = async (
  pb: PocketBase,
  startDate: string,
  endDate: string,
): Promise<ICalendarEvent[]> => {
  const start = moment(startDate).startOf("day").toISOString();
  const end = moment(endDate).endOf("day").toISOString();

  return await pb.collection("calendar_events").getFullList<ICalendarEvent>({
    filter: `(start >= '${start}' || end >= '${start}') && (start <= '${end}' || end <= '${end}')`,
  });
};

export const getTodayEvents = async (
  pb: PocketBase,
): Promise<ICalendarEvent[]> => {
  const start = moment().startOf("day").toISOString();
  const end = moment().endOf("day").toISOString();

  const allEvents = await pb
    .collection("calendar_events")
    .getFullList<ICalendarEvent>();

  return allEvents.filter((event) => {
    return moment(event.start).isBetween(start, end, null, "[]");
  });
};

export const createEvent = async (
  pb: PocketBase,
  eventData: WithoutPBDefault<ICalendarEvent>,
): Promise<ICalendarEvent> => {
  return await pb
    .collection("calendar_events")
    .create<ICalendarEvent>(eventData);
};

export const updateEvent = async (
  pb: PocketBase,
  id: string,
  eventData: WithoutPBDefault<ICalendarEvent>,
): Promise<ICalendarEvent> => {
  return await pb
    .collection("calendar_events")
    .update<ICalendarEvent>(id, eventData);
};

export const deleteEvent = async (
  pb: PocketBase,
  id: string,
): Promise<boolean> => {
  return await pb.collection("calendar_events").delete(id);
};

export const getEventById = async (
  pb: PocketBase,
  id: string,
): Promise<ICalendarEvent> => {
  return await pb.collection("calendar_events").getOne<ICalendarEvent>(id);
};
