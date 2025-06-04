import { z } from "zod/v4";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import { zodHandler } from "@utils/asyncWrapper";

import * as entriesService from "../services/entries.service";
import { MovieEntrySchema } from "../typescript/movies_interfaces";

export const getAllEntries = zodHandler(
  {
    response: z.array(WithPBSchema(MovieEntrySchema)),
  },
  ({ pb }) => entriesService.getAllEntries(pb),
);

export const createEntryFromTMDB = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: WithPBSchema(MovieEntrySchema),
  },
  ({ pb, params: { id } }) => entriesService.createEntryFromTMDB(pb, id),
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
  ({ pb, params: { id } }) => entriesService.deleteEntry(pb, id),
  {
    existenceCheck: {
      params: {
        id: "movies_entries",
      },
    },
    statusCode: 204,
  },
);

export const toggleWatchStatus = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: WithPBSchema(MovieEntrySchema),
  },
  ({ pb, params: { id } }) => entriesService.toggleWatchStatus(pb, id),
  {
    existenceCheck: {
      params: {
        id: "movies_entries",
      },
    },
  },
);
