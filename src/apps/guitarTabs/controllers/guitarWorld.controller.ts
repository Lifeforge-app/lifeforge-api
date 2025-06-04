import { z } from "zod";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import { zodHandler } from "@utils/asyncWrapper";

import * as guitarWorldService from "../services/guitarWorld.service";
import {
  GuitarTabsEntrySchema,
  GuitarTabsGuitarWorldEntrySchema,
} from "../typescript/guitar_tabs_interfaces";

export const getTabsList = zodHandler(
  {
    body: z.object({
      cookie: z.string(),
      page: z.number().optional().default(1),
    }),
    response: z.object({
      data: z.array(GuitarTabsGuitarWorldEntrySchema),
      totalItems: z.number(),
      perPage: z.number(),
    }),
  },
  async ({ body: { cookie, page } }) =>
    await guitarWorldService.getTabsList(cookie, page),
);

export const downloadTab = zodHandler(
  {
    body: z.object({
      cookie: z.string(),
      id: z.string(),
      name: z.string(),
      category: z.string(),
      mainArtist: z.string(),
      audioUrl: z.string(),
    }),
    response: WithPBSchema(GuitarTabsEntrySchema),
  },
  async ({ pb, body }) => await guitarWorldService.downloadTab(pb, body),
);
