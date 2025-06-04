import { z } from "zod/v4";

import { forgeController } from "@utils/zodifiedHandler";

import * as TMDBService from "../services/tmdb.service";

export const searchMovies = forgeController(
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
