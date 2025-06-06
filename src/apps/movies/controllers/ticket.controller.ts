import { z } from "zod/v4";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import { forgeController } from "@utils/forgeController";

import * as TicketService from "../services/ticket.service";
import { MovieEntrySchema } from "../typescript/movies_interfaces";

export const updateTicket = forgeController(
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

export const clearTicket = forgeController(
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
