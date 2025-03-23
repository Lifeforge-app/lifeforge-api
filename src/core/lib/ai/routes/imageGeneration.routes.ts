import asyncWrapper from "@utils/asyncWrapper";
import { getAPIKey } from "@utils/getAPIKey";
import { clientError, successWithBaseResponse } from "@utils/response";
import express from "express";
import { body } from "express-validator";
import OpenAI from "openai";

const router = express.Router();

router.get(
  "/key-exists",
  asyncWrapper(async (req, res) => {
    const { pb } = req;

    const key = await getAPIKey("openai", pb);

    successWithBaseResponse(res, !!key);
  }),
);

router.post(
  "/generate-image",
  [body("prompt").isString()],
  asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { prompt } = req.body;

    const key = await getAPIKey("openai", pb);

    if (!key) {
      clientError(res, "OpenAI API key not found");
      return;
    }

    const openai = new OpenAI({
      apiKey: key,
    });

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1792x1024",
    });

    if (!response.data.length) {
      clientError(res, "Failed to generate image");
      return;
    }

    successWithBaseResponse(res, response.data[0].url);
  }),
);

export default router;
