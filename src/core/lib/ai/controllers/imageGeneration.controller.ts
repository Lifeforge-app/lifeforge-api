import { forgeController } from "@functions/forgeController";
import { getAPIKey } from "@functions/getAPIKey";
import { z } from "zod/v4";

import * as ImageGenerationService from "../services/imageGeneration.service";

export const checkKey = forgeController(
  {
    response: z.boolean(),
  },
  async ({ pb }) => !!(await getAPIKey("openai", pb)),
);

export const generateImage = forgeController(
  {
    body: z.object({
      prompt: z.string().min(1, "Prompt cannot be empty"),
    }),
    response: z.string(),
  },
  async ({ pb, body: { prompt } }) =>
    ImageGenerationService.generateImage(pb, prompt),
);
