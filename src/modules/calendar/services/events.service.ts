import moment from "moment";
import PocketBase from "pocketbase";
import { WithoutPBDefault } from "../../../core/typescript/pocketbase_interfaces";
import { ICalendarEvent } from "../typescript/calendar_interfaces";

/**
 * Fetch all calendar events for a specific date range
 */
export const getEventsByDateRange = async (
  pb: PocketBase,
  startDate: string,
  endDate: string,
): Promise<ICalendarEvent[]> => {
  return await pb.collection("calendar_events").getFullList<ICalendarEvent>({
    filter: `start >= '${startDate}' && end <= '${endDate}'`,
  });
};

/**
 * Fetch all calendar events for today
 */
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

/**
 * Create a new calendar event
 */
export const createEvent = async (
  pb: PocketBase,
  eventData: WithoutPBDefault<ICalendarEvent>,
): Promise<ICalendarEvent> => {
  return await pb
    .collection("calendar_events")
    .create<ICalendarEvent>(eventData);
};

/**
 * Update an existing calendar event
 */
export const updateEvent = async (
  pb: PocketBase,
  id: string,
  eventData: WithoutPBDefault<ICalendarEvent>,
): Promise<ICalendarEvent> => {
  return await pb
    .collection("calendar_events")
    .update<ICalendarEvent>(id, eventData);
};

/**
 * Delete a calendar event
 */
export const deleteEvent = async (
  pb: PocketBase,
  id: string,
): Promise<boolean> => {
  return await pb.collection("calendar_events").delete(id);
};

/**
 * Get a single calendar event by ID
 */
export const getEventById = async (
  pb: PocketBase,
  id: string,
): Promise<ICalendarEvent> => {
  return await pb.collection("calendar_events").getOne<ICalendarEvent>(id);
};
