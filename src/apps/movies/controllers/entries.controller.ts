import {
  bulkRegisterControllers,
  forgeController,
} from "@functions/forgeController";
import express from "express";
import { z } from "zod/v4";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import * as entriesService from "../services/entries.service";
import { MovieEntrySchema } from "../typescript/movies_interfaces";

const moviesEntriesRouter = express.Router();

const getAllEntries = forgeController
  .route("GET /")
  .description("Get all movie entries")
  .schema({
    query: z.object({
      watched: z
        .enum(["true", "false"])
        .optional()
        .default("false")
        .transform((val) => (val === "true" ? true : false)),
    }),
    response: z.object({
      entries: z.array(WithPBSchema(MovieEntrySchema)),
      total: z.number(),
    }),
  })
  .callback(({ pb, query: { watched } }) =>
    entriesService.getAllEntries(pb, watched),
  );

const createEntryFromTMDB = forgeController
  .route("POST /:id")
  .description("Create a movie entry from TMDB")
  .schema({
    params: z.object({
      id: z.string(),
    }),
    response: WithPBSchema(MovieEntrySchema),
  })
  .callback(({ pb, params: { id } }) =>
    entriesService.createEntryFromTMDB(pb, id),
  )
  .statusCode(201);

const deleteEntry = forgeController
  .route("DELETE /:id")
  .description("Delete a movie entry")
  .schema({
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  })
  .existenceCheck("params", {
    id: "movies__entries",
  })
  .callback(({ pb, params: { id } }) => entriesService.deleteEntry(pb, id))
  .statusCode(204);

const toggleWatchStatus = forgeController
  .route("PATCH /watch-status/:id")
  .description("Toggle watch status of a movie entry")
  .schema({
    params: z.object({
      id: z.string(),
    }),
    response: WithPBSchema(MovieEntrySchema),
  })
  .existenceCheck("params", {
    id: "movies__entries",
  })
  .callback(({ pb, params: { id } }) =>
    entriesService.toggleWatchStatus(pb, id),
  );

bulkRegisterControllers(moviesEntriesRouter, [
  getAllEntries,
  createEntryFromTMDB,
  deleteEntry,
  toggleWatchStatus,
]);

export default moviesEntriesRouter;
