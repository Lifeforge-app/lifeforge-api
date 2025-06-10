import express from "express";
import { z } from "zod/v4";

import ClientError from "@utils/ClientError";
import { forgeController } from "@utils/forgeController";
import { getAPIKey } from "@utils/getAPIKey";

import { PixabaySearchResultSchema } from "./typescript/pixabay_interfaces";

const router = express.Router();

router.get(
  "/key-exists",
  forgeController(
    {
      response: z.boolean(),
    },
    async ({ pb }) => !!(await getAPIKey("pixabay", pb)),
  ),
);

router.get(
  "/search",
  forgeController(
    {
      query: z.object({
        q: z.string().min(1),
        page: z
          .string()
          .optional()
          .default("1")
          .transform((val) => parseInt(val, 10) || 1),
        type: z.enum(["all", "photo", "illustration", "vector"]).default("all"),
        category: z
          .enum([
            "backgrounds",
            "fashion",
            "nature",
            "science",
            "education",
            "feelings",
            "health",
            "people",
            "religion",
            "places",
            "animals",
            "industry",
            "computer",
            "food",
            "sports",
            "transportation",
            "travel",
            "buildings",
            "business",
            "music",
          ])
          .optional(),
        colors: z
          .enum([
            "grayscale",
            "transparent",
            "red",
            "orange",
            "yellow",
            "green",
            "turquoise",
            "blue",
            "lilac",
            "pink",
            "white",
            "gray",
            "black",
            "brown",
          ])
          .optional()
          .nullable(),
        editors_choice: z
          .enum(["true", "false"])
          .default("false")
          .transform((val) => val === "true"),
      }),
      response: PixabaySearchResultSchema,
    },
    async ({
      query: { q, page, type, category, colors, editors_choice },
      pb,
    }) => {
      const key = await getAPIKey("pixabay", pb);

      if (!key) {
        throw new ClientError("Pixabay API key is not set");
      }

      const url = new URL("https://pixabay.com/api/");

      url.searchParams.append("key", key);
      url.searchParams.append("q", q);
      url.searchParams.append("page", page.toString());
      url.searchParams.append("image_type", type);
      if (category) {
        url.searchParams.append("category", category);
      }
      if (colors) {
        url.searchParams.append("colors", colors);
      }
      url.searchParams.append("editors_choice", editors_choice.toString());

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(
          `Pixabay API request failed with status ${response.status}`,
        );
      }

      const data = await response.json();

      return {
        total: data.totalHits,
        hits: data.hits.map((hit: any) => ({
          id: hit.id,
          thumbnail: {
            url: hit.webformatURL,
            width: hit.webformatWidth,
            height: hit.webformatHeight,
          },
          imageURL: hit.largeImageURL,
        })),
      };
    },
  ),
);

export default router;
