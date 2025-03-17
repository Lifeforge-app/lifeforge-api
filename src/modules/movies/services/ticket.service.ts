import PocketBase from "pocketbase";
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

export const clearTicket = async (pb: PocketBase, id: string) => {
  await pb.collection("movies_entries").update<IMovieEntry>(id, {
    ticket_number: "",
    theatre_location: "",
    theatre_number: "",
    theatre_seat: "",
    theatre_showtime: "",
  });
};
