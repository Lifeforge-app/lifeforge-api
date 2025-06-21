import { forgeController } from "@functions/forgeController";
import { z } from "zod/v4";

import * as PersonalizationService from "../services/personalization.service";

export const listGoogleFonts = forgeController(
  {
    response: z.object({
      enabled: z.boolean(),
      items: z.array(z.any()).optional(),
    }),
  },
  async ({ pb }) => PersonalizationService.listGoogleFonts(pb),
);

export const getGoogleFont = forgeController(
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

export const updateBgImage = forgeController(
  {
    body: z.object({
      url: z.string().optional(),
    }),
    response: z.string(),
  },
  async ({ pb, body: { url }, req }) =>
    PersonalizationService.updateBgImage(pb, req.file, url),
);

export const deleteBgImage = forgeController(
  {
    response: z.void(),
  },
  async ({ pb }) =>
    await PersonalizationService.deleteBgImage(pb, pb.authStore.record!.id),
  {
    statusCode: 204,
  },
);

export const updatePersonalization = forgeController(
  {
    body: z.object({
      data: z.object({
        fontFamily: z.string().optional(),
        theme: z.string().optional(),
        color: z.string().optional(),
        bgTemp: z.string().optional(),
        language: z.string().optional(),
        dashboardLayout: z.record(z.string(), z.any()).optional(),
        backdropFilters: z.record(z.string(), z.any()).optional(),
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
