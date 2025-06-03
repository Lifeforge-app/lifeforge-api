import { Request, Response } from "express";
import { z } from "zod";

import { BaseResponse } from "@typescript/base_response";
import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import { zodHandler } from "@utils/asyncWrapper";
import { successWithBaseResponse } from "@utils/response";

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
  async (req, res) => {
    const { cookie, page } = req.body;

    const data = await guitarWorldService.getTabsList(cookie, page);

    successWithBaseResponse(res, data);
  },
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
  async (req, res) => {
    const { cookie, id, name, category, mainArtist, audioUrl } = req.body;

    const newEntry = await guitarWorldService.downloadTab(
      req.pb,
      cookie,
      id,
      name,
      category,
      mainArtist,
      audioUrl,
    );
    successWithBaseResponse(res, newEntry);
  },
);
