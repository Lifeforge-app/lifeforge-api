import fs from "fs";
import { z } from "zod/v4";

import { zodHandler } from "@utils/asyncWrapper";

import * as PersonalizationService from "../services/personalization.service";

export const listGoogleFonts = zodHandler(
  {
    response: z.object({
      enabled: z.boolean(),
      items: z.array(z.any()).optional(),
    }),
  },
  async ({ pb }) => PersonalizationService.listGoogleFonts(pb),
);

export const getGoogleFont = zodHandler(
  {
    query: z.object({
      family: z.string(),
    }),
    response: z.object({
      enabled: z.boolean(),
      items: z.array(z.any()).optional(),
    }),
  },
  async ({ pb, query: { family } }) =>
    PersonalizationService.getGoogleFont(pb, family),
);

export const updateBgImage = zodHandler(
  {
    body: z.object({
      url: z.string().optional(),
    }),
    response: z.string(),
  },
  async ({ pb, body: { url }, req }) =>
    PersonalizationService.updateBgImage(pb, req.file, url),
);

export const deleteBgImage = zodHandler(
  {
    response: z.void(),
  },
  async ({ pb }) =>
    await PersonalizationService.deleteBgImage(pb, pb.authStore.record!.id),
  {
    statusCode: 204,
  },
);

export const updatePersonalization = zodHandler(
  {
    body: z.object({
      data: z.object({
        fontFamily: z.string().optional(),
        theme: z.string().optional(),
        color: z.string().optional(),
        bgTemp: z.string().optional(),
        language: z.string().optional(),
        dashboardLayout: z.object({}).optional(),
        backdropFilters: z.object({}).optional(),
      }),
    }),
    response: z.void(),
  },
  async ({ pb, body: { data } }) =>
    await PersonalizationService.updatePersonalization(
      pb,
      pb.authStore.record!.id,
      data,
    ),
  {
    statusCode: 204,
  },
);
