import {
  bulkRegisterControllers,
  forgeController,
} from "@functions/forgeController";
import express from "express";
import { z } from "zod/v4";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import * as guitarWorldService from "../services/guitarWorld.service";
import {
  GuitarTabsEntrySchema,
  GuitarTabsGuitarWorldEntrySchema,
} from "../typescript/guitar_tabs_interfaces";

const guitarTabsGuitarWorldRouter = express.Router();

const getTabsList = forgeController
  .route("POST /")
  .description("Get tabs list from Guitar World")
  .schema({
    body: z.object({
      cookie: z.string(),
      page: z.number().optional().default(1),
    }),
    response: z.object({
      data: z.array(GuitarTabsGuitarWorldEntrySchema),
      totalItems: z.number(),
      perPage: z.number(),
    }),
  })
  .callback(
    async ({ body: { cookie, page } }) =>
      await guitarWorldService.getTabsList(cookie, page),
  );

const downloadTab = forgeController
  .route("POST /download")
  .description("Download a guitar tab from Guitar World")
  .schema({
    body: z.object({
      cookie: z.string(),
      id: z.number(),
      name: z.string(),
      category: z.string(),
      mainArtist: z.string(),
      audioUrl: z.string(),
    }),
    response: z.string(),
  })
  .statusCode(202)
  .callback(
    async ({ pb, body, io }) =>
      await guitarWorldService.downloadTab(io, pb, body),
  );

bulkRegisterControllers(guitarTabsGuitarWorldRouter, [
  getTabsList,
  downloadTab,
]);

export default guitarTabsGuitarWorldRouter;
