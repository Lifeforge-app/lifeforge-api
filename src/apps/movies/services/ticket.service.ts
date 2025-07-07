import PocketBase from "pocketbase";

import { WithPB } from "@typescript/pocketbase_interfaces";

import { IMovieEntry } from "../typescript/movies_interfaces";

export const updateTicket = (
  pb: PocketBase,
  ticketData: Pick<
    IMovieEntry,
    "ticket_number" | "theatre_number" | "theatre_seat" | "theatre_showtime"
  > & {
    entry_id: string;
    theatre_location: {
      displayName: {
        text: string;
        languageCode: string;
      };
      location: {
        latitude: number;
        longitude: number;
      };
    };
  },
): Promise<WithPB<IMovieEntry>> => {
  (ticketData as any).theatre_location =
    ticketData.theatre_location.displayName.text;

  return pb
    .collection("movies_entries")
    .update<WithPB<IMovieEntry>>(ticketData.entry_id, ticketData);
};

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
