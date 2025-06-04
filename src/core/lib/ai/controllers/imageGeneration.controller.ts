import { z } from "zod/v4";

import { zodHandler } from "@utils/asyncWrapper";
import { getAPIKey } from "@utils/getAPIKey";

import * as ImageGenerationService from "../services/imageGeneration.service";

export const checkKey = zodHandler(
  {
    response: z.boolean(),
  },
  async ({ pb }) => !!(await getAPIKey("openai", pb)),
);

export const generateImage = zodHandler(
  {
    body: z.object({
      prompt: z.string().min(1, "Prompt cannot be empty"),
    }),
    response: z.string(),
  },
  async ({ pb, body: { prompt } }) =>
    ImageGenerationService.generateImage(pb, prompt),
);
