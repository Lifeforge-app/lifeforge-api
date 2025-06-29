import ClientError from "@functions/ClientError";
import {
  bulkRegisterControllers,
  forgeController,
} from "@functions/forgeController";
import express from "express";
import { z } from "zod/v4";

import {
  PBListResultSchema,
  WithPBSchema,
} from "@typescript/pocketbase_interfaces";

import { uploadMiddleware } from "@middlewares/uploadMiddleware";

import * as entriesService from "../services/entries.service";
import {
  GuitarTabsEntrySchema,
  GuitarTabsSidebarDataSchema,
} from "../typescript/guitar_tabs_interfaces";

const guitarTabsEntriesRouter = express.Router();

const getSidebarData = forgeController
  .route("GET /sidebar-data")
  .description("Get sidebar data for guitar tabs")
  .schema({
    response: GuitarTabsSidebarDataSchema,
  })
  .callback(async ({ pb }) => await entriesService.getSidebarData(pb));

const getEntries = forgeController
  .route("GET /")
  .description("Get guitar tabs entries")
  .schema({
    query: z.object({
      page: z
        .string()
        .optional()
        .transform((val) => parseInt(val ?? "1", 10) || 1),
      query: z.string().optional(),
      category: z.string().optional(),
      author: z.string().optional(),
      starred: z
        .string()
        .optional()
        .transform((val) => val === "true"),
      sort: z
        .enum(["name", "author", "newest", "oldest"])
        .optional()
        .default("newest"),
    }),
    response: PBListResultSchema(WithPBSchema(GuitarTabsEntrySchema)),
  })
  .callback(
    async ({ pb, query }) => await entriesService.getEntries(pb, query),
  );

const getRandomEntry = forgeController
  .route("GET /random")
  .description("Get a random guitar tab entry")
  .schema({
    response: WithPBSchema(GuitarTabsEntrySchema),
  })
  .callback(async ({ pb }) => await entriesService.getRandomEntry(pb));

const uploadFiles = forgeController
  .route("POST /upload")
  .description("Upload guitar tab files")
  .middlewares(uploadMiddleware)
  .schema({
    response: z.boolean(),
  })
  .statusCode(202)
  .callback(async ({ pb, req }) => {
    const files = req.files;

    if (!files) {
      throw new ClientError("No files provided");
    }

    const result = await entriesService.uploadFiles(
      pb,
      files as Express.Multer.File[],
    );

    if (result.status === "error") {
      throw new Error(result.message);
    }

    return true;
  });

const getProcessStatus = forgeController
  .route("GET /process-status")
  .description("Get file processing status")
  .schema({
    response: z.any(),
  })
  .callback(async () => entriesService.getProcessStatus());

const updateEntry = forgeController
  .route("PATCH /:id")
  .description("Update a guitar tab entry")
  .schema({
    params: z.object({
      id: z.string(),
    }),
    body: GuitarTabsEntrySchema.pick({
      name: true,
      author: true,
      type: true,
    }),
    response: WithPBSchema(GuitarTabsEntrySchema),
  })
  .existenceCheck("params", {
    id: "guitar_tabs_entries",
  })
  .callback(
    async ({ pb, params: { id }, body }) =>
      await entriesService.updateEntry(pb, id, body),
  );

const deleteEntry = forgeController
  .route("DELETE /:id")
  .description("Delete a guitar tab entry")
  .schema({
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  })
  .existenceCheck("params", {
    id: "guitar_tabs_entries",
  })
  .statusCode(204)
  .callback(
    async ({ pb, params: { id } }) => await entriesService.deleteEntry(pb, id),
  );

const toggleFavorite = forgeController
  .route("POST /favourite/:id")
  .description("Toggle favorite status of a guitar tab entry")
  .schema({
    params: z.object({
      id: z.string(),
    }),
    response: WithPBSchema(GuitarTabsEntrySchema),
  })
  .existenceCheck("params", {
    id: "guitar_tabs_entries",
  })
  .callback(
    async ({ pb, params: { id } }) =>
      await entriesService.toggleFavorite(pb, id),
  );

bulkRegisterControllers(guitarTabsEntriesRouter, [
  getSidebarData,
  getEntries,
  getRandomEntry,
  uploadFiles,
  getProcessStatus,
  updateEntry,
  deleteEntry,
  toggleFavorite,
]);

export default guitarTabsEntriesRouter;
