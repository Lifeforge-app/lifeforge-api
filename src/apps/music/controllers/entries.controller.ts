import { z } from "zod";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import { zodHandler } from "@utils/asyncWrapper";

import * as EntriesService from "../services/entries.service";
import { MusicEntrySchema } from "../typescript/music_interfaces";

export const getAllEntries = zodHandler(
  {
    response: z.array(WithPBSchema(MusicEntrySchema)),
  },
  async ({ pb }) => await EntriesService.getAllEntries(pb),
);

export const updateEntry = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    body: MusicEntrySchema.pick({ name: true, author: true }),
    response: WithPBSchema(MusicEntrySchema),
  },
  async ({ pb, params: { id }, body }) =>
    await EntriesService.updateEntry(pb, id, body),
);

export const deleteEntry = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  },
  async ({ pb, params: { id } }) => EntriesService.deleteEntry(pb, id),
  {
    existenceCheck: {
      params: {
        id: "music_entries",
      },
    },
    statusCode: 204,
  },
);

export const toggleFavorite = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: WithPBSchema(MusicEntrySchema),
  },
  async ({ pb, params: { id } }) => await EntriesService.toggleFavorite(pb, id),
  {
    existenceCheck: {
      params: {
        id: "music_entries",
      },
    },
  },
);
