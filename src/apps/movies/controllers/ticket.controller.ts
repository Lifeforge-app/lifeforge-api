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
  (req) => TicketService.updateTicket(req.pb, req.body),
  {
    existenceCheck: {
      entry_id: "movies_entries",
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
  (req) => TicketService.clearTicket(req.pb, req.params.id),
  {
    existenceCheck: {
      id: "movies_entries",
    },
    statusCode: 204,
  },
);
