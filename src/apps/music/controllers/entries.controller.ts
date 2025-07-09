import {
  bulkRegisterControllers,
  forgeController,
} from "@functions/forgeController";
import express from "express";
import { z } from "zod/v4";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import * as EntriesService from "../services/entries.service";
import { MusicEntrySchema } from "../typescript/music_interfaces";

const musicEntriesRouter = express.Router();

const getAllEntries = forgeController
  .route("GET /")
  .description("Get all music entries")
  .schema({
    response: z.array(WithPBSchema(MusicEntrySchema)),
  })
  .callback(async ({ pb }) => await EntriesService.getAllEntries(pb));

const updateEntry = forgeController
  .route("PATCH /:id")
  .description("Update a music entry")
  .schema({
    params: z.object({
      id: z.string(),
    }),
    body: MusicEntrySchema.pick({ name: true, author: true }),
    response: WithPBSchema(MusicEntrySchema),
  })
  .callback(
    async ({ pb, params: { id }, body }) =>
      await EntriesService.updateEntry(pb, id, body),
  );

const deleteEntry = forgeController
  .route("DELETE /:id")
  .description("Delete a music entry")
  .schema({
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  })
  .existenceCheck("params", {
    id: "music__entries",
  })
  .callback(async ({ pb, params: { id } }) =>
    EntriesService.deleteEntry(pb, id),
  )
  .statusCode(204);

const toggleFavorite = forgeController
  .route("POST /favourite/:id")
  .description("Toggle favorite status of a music entry")
  .schema({
    params: z.object({
      id: z.string(),
    }),
    response: WithPBSchema(MusicEntrySchema),
  })
  .existenceCheck("params", {
    id: "music__entries",
  })
  .callback(
    async ({ pb, params: { id } }) =>
      await EntriesService.toggleFavorite(pb, id),
  );

bulkRegisterControllers(musicEntriesRouter, [
  getAllEntries,
  updateEntry,
  deleteEntry,
  toggleFavorite,
]);

export default musicEntriesRouter;
