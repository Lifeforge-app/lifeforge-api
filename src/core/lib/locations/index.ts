import ClientError from "@functions/ClientError";
import {
  bulkRegisterControllers,
  forgeController,
} from "@functions/forgeController";
import { getAPIKey } from "@functions/getAPIKey";
import express from "express";
import { z } from "zod/v4";

const router = express.Router();

const getLocation = forgeController
  .route("GET /")
  .description("Search for locations")
  .schema({
    query: z.object({
      q: z.string(),
    }),
    response: z.any(),
  })
  .callback(async ({ query: { q }, pb }) => {
    const key = await getAPIKey("gcloud", pb);

    if (!key) {
      throw new ClientError("API key not found");
    }

    return await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(q as string)}&key=${key}`,
    ).then((response) => response.json());
  });

const checkIsEnabled = forgeController
  .route("GET /enabled")
  .description("Check if Google Cloud API key exists")
  .schema({
    response: z.boolean(),
  })
  .callback(async ({ pb }) => {
    const key = await getAPIKey("gcloud", pb);
    return !!key;
  });

bulkRegisterControllers(router, [getLocation, checkIsEnabled]);

export default router;
