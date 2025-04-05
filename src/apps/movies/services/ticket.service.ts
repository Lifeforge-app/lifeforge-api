import moment from "moment";
import PocketBase from "pocketbase";
import { ICalendarEvent } from "../../calendar/typescript/calendar_interfaces";
import { IMovieEntry } from "../typescript/movies_interfaces";

export interface TicketData {
  ticket_number: string;
  theatre_location: string;
  theatre_number: string;
  theatre_seat: string;
  theatre_showtime: string;
}

export const updateTicket = async (
  pb: PocketBase,
  entry_id: string,
  ticketData: TicketData,
) => {
  return await pb
    .collection("movies_entries")
    .update<IMovieEntry>(entry_id, ticketData);
};

export const addToCalendar = async (
  pb: PocketBase,
  id: string,
  category: string,
) => {
  const entry = await pb.collection("movies_entries").getOne<IMovieEntry>(id);

  const calendarEvent = {
    start: entry.theatre_showtime,
    end: moment(entry.theatre_showtime)
      .add(entry.duration, "minutes")
      .toISOString(),
    title: entry.title,
    location: entry.theatre_location,
    category,
    reference_link: `/movies?show-ticket=${entry.id}`,
    cannot_delete: true,
  };

  const calendarEntry = await pb
    .collection("calendar_events")
    .create<ICalendarEvent>(calendarEvent);

  const updatedEntry = await pb
    .collection("movies_entries")
    .update<IMovieEntry>(id, {
      calendar_record: calendarEntry.id,
    });

  return updatedEntry;
};

export const clearTicket = async (pb: PocketBase, id: string) => {
  await pb.collection("movies_entries").update<IMovieEntry>(id, {
    ticket_number: "",
    theatre_location: "",
    theatre_number: "",
    theatre_seat: "",
    theatre_showtime: "",
  });
};
