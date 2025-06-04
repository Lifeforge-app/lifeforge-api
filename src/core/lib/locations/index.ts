import express from "express";
import { z } from "zod/v4";

import ClientError from "@utils/ClientError";
import { getAPIKey } from "@utils/getAPIKey";
import { forgeController } from "@utils/zodifiedHandler";

const router = express.Router();

router.get(
  "/",
  forgeController(
    {
      query: z.object({
        q: z.string(),
      }),
      response: z.any(),
    },
    async ({ query: { q }, pb }) => {
      const key = await getAPIKey("gcloud", pb);

      if (!key) {
        throw new ClientError("API key not found");
      }

      return await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(q as string)}&key=${key}`,
      ).then((response) => response.json());
    },
  ),
);

router.get(
  "/enabled",
  forgeController(
    {
      response: z.boolean(),
    },
    async ({ pb }) => !!(await getAPIKey("gcloud", pb)),
  ),
);

export default router;
