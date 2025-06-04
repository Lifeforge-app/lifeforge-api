import { z } from "zod";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import { zodHandler } from "@utils/asyncWrapper";

import * as TicketService from "../services/ticket.service";
import { MovieEntrySchema } from "../typescript/movies_interfaces";

export const updateTicket = zodHandler(
  {
    body: MovieEntrySchema.pick({
      ticket_number: true,
      theatre_location: true,
      theatre_number: true,
      theatre_seat: true,
      theatre_showtime: true,
    }).extend({
      entry_id: z.string(),
    }),
    response: WithPBSchema(MovieEntrySchema),
  },
  ({ pb, body }) => TicketService.updateTicket(pb, body),
  {
    existenceCheck: {
      params: {
        entry_id: "movies_entries",
      },
    },
  },
);

export const clearTicket = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  },
  ({ pb, params: { id } }) => TicketService.clearTicket(pb, id),
  {
    existenceCheck: {
      params: {
        id: "movies_entries",
      },
    },
    statusCode: 204,
  },
);
