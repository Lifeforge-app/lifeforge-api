import { z } from "zod";

import { zodHandler } from "@utils/asyncWrapper";

import * as TMDBService from "../services/tmdb.service";

export const searchMovies = zodHandler(
  {
    query: z.object({
      q: z.string().min(1, "Query must not be empty"),
      page: z
        .string()
        .optional()
        .default("1")
        .transform((val) => parseInt(val) || 1),
    }),
    response: z.any(),
  },
  ({ pb, query: { q, page } }) => TMDBService.searchMovies(pb, q, page),
);
