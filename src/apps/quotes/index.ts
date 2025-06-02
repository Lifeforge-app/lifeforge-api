import { BaseResponse } from "@typescript/base_response";
import asyncWrapper from "@utils/asyncWrapper";
import { fetchAI } from "@utils/fetchAI";
import { getAPIKey } from "@utils/getAPIKey";
import {
  clientError,
  serverError,
  successWithBaseResponse,
} from "@utils/response";
import express, { Response } from "express";

const router = express.Router();

const cache: string[] = [];

router.get(
  "/",
  asyncWrapper(async (req, res: Response<BaseResponse<string>>) => {
    const key = await getAPIKey("groq", req.pb);

    if (!key) {
      clientError(res, "API key not found");
      return;
    }

    const isFetchingNewQuote = cache.length === 0 || Math.random() < 0.1;

    if (!isFetchingNewQuote) {
      const randomPick = Math.floor(Math.random() * cache.length);
      successWithBaseResponse(res, cache[randomPick]);
      return;
    }

    const prompt = `Generate a random quote related to technology or programming. Feel free to be creative with that. You may craft a quote that does not exist before. The quote should be only a single sentence. Give only the quote without any additional information. Below are the prexisting quotes, try your best to generate a new one without having too much repetition with the existing ones.

    ${cache.join("\n")}`;

    const result = await fetchAI({
      provider: "groq",
      apiKey: key,
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });
    if (result) {
      cache.push(result);
      successWithBaseResponse(res, result);
    } else {
      serverError(res, "Failed to fetch quote");
    }
  }),
);

export default router;
