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
  try {
    return await pb
      .collection("movies_entries")
      .update<IMovieEntry>(entry_id, ticketData);
  } catch (error) {
    throw error;
  }
};

export const clearTicket = async (pb: PocketBase, id: string) => {
  try {
    await pb.collection("movies_entries").update<IMovieEntry>(id, {
      ticket_number: "",
      theatre_location: "",
      theatre_number: "",
      theatre_seat: "",
      theatre_showtime: "",
    });
  } catch (error) {
    throw error;
  }
};
