import express from "express";
import { query } from "express-validator";
import asyncWrapper from "../../utils/asyncWrapper";
import hasError from "../../utils/checkError";
import { getAPIKey } from "../../utils/getAPIKey";
import {
  clientError,
  serverError,
  successWithBaseResponse,
} from "../../utils/response";
import entriesRoutes from "./routes/entries";

const router = express.Router();

router.use("/entries", entriesRoutes);

router.get(
  "/search",
  [query("q").isString(), query("page").isInt({ min: 1 })],
  asyncWrapper(async (req, res) => {
    if (hasError(req, res)) return;

    const { pb } = req;
    const apiKey = await getAPIKey("tmdb", pb);

    if (!apiKey) {
      clientError(res, "API key not found");
      return;
    }

    const { q, page } = req.query;

    const url = `https://api.themoviedb.org/3/search/movie?query=${decodeURIComponent(q)}&page=${page}`;

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }).then((res) => res.json());

      successWithBaseResponse(res, response);
    } catch (error) {
      if (error instanceof Error) {
        serverError(res, error.message);
      } else {
        serverError(res, "Unknown error");
      }
    }
  })
);

export default router;
