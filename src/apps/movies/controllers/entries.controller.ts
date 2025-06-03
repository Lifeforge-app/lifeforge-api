import { z } from "zod";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import { zodHandler } from "@utils/asyncWrapper";

import * as entriesService from "../services/entries.service";
import { MovieEntrySchema } from "../typescript/movies_interfaces";

export const getAllEntries = zodHandler(
  {
    response: z.array(WithPBSchema(MovieEntrySchema)),
  },
  (req) => entriesService.getAllEntries(req.pb),
);

export const createEntryFromTMDB = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: WithPBSchema(MovieEntrySchema),
  },
  (req) => entriesService.createEntryFromTMDB(req.pb, req.params.id),
  {
    statusCode: 201,
  },
);

export const deleteEntry = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  },
  (req) => entriesService.deleteEntry(req.pb, req.params.id),
  {
    statusCode: 204,
    existenceCheck: {
      id: "movies_entries",
    },
  },
);

export const toggleWatchStatus = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: WithPBSchema(MovieEntrySchema),
  },
  (req) => entriesService.toggleWatchStatus(req.pb, req.params.id),
  {
    existenceCheck: {
      id: "movies_entries",
    },
  },
);
