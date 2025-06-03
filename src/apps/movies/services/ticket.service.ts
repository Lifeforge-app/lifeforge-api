import PocketBase from "pocketbase";

import { WithPB } from "@typescript/pocketbase_interfaces";

import { IMovieEntry } from "../typescript/movies_interfaces";

export const updateTicket = (
  pb: PocketBase,
  ticketData: Pick<
    IMovieEntry,
    | "ticket_number"
    | "theatre_location"
    | "theatre_number"
    | "theatre_seat"
    | "theatre_showtime"
  > & { entry_id: string },
): Promise<WithPB<IMovieEntry>> =>
  pb
    .collection("movies_entries")
    .update<WithPB<IMovieEntry>>(ticketData.entry_id, ticketData);

export const clearTicket = async (
  pb: PocketBase,
  id: string,
): Promise<void> => {
  await pb.collection("movies_entries").update<WithPB<IMovieEntry>>(id, {
    ticket_number: "",
    theatre_location: "",
    theatre_number: "",
    theatre_seat: "",
    theatre_showtime: "",
  });
};
