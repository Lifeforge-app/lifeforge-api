import { forgeController } from "@functions/forgeController";
import { z } from "zod/v4";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import * as EntriesService from "../services/entries.service";
import { MusicEntrySchema } from "../typescript/music_interfaces";

export const getAllEntries = forgeController(
  {
    response: z.array(WithPBSchema(MusicEntrySchema)),
  },
  async ({ pb }) => await EntriesService.getAllEntries(pb),
);

export const updateEntry = forgeController(
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

export const deleteEntry = forgeController(
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

export const toggleFavorite = forgeController(
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
