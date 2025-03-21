import asyncWrapper from "@utils/asyncWrapper";
import { getAPIKey } from "@utils/getAPIKey";
import { serverError, successWithBaseResponse } from "@utils/response";
import express, { Response } from "express";
import { query } from "express-validator";
import { BaseResponse } from "../../typescript/base_response";
import IPixabaySearchResult from "./typescript/pixabay_interfaces";

const router = express.Router();

router.get(
  "/key-exists",
  asyncWrapper(async (req, res) => {
    const key = await getAPIKey("pixabay", req.pb);

    successWithBaseResponse(res, !!key);
  }),
);

router.get(
  "/search",
  [
    query("q").isString().trim().escape(),
    query("page").isInt().toInt(),
    query("type").isString().isIn(["all", "photo", "illustration", "vector"]),
    query("category")
      .isString()
      .isIn([
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
        "",
      ]),
    query("colors")
      .isString()
      .isIn([
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
        "",
      ]),
    query("editors_choice").isBoolean().toBoolean(),
  ],
  asyncWrapper(
    async (req, res: Response<BaseResponse<IPixabaySearchResult>>) => {
      const key = await getAPIKey("pixabay", req.pb);
      const { q, page, type, category, colors, editors_choice } =
        req.query as Record<string, string>;

      if (!key) {
        res.status(500).json({
          state: "error",
          message: "API key not found",
        });
        return;
      }

      const url = new URL("https://pixabay.com/api/");

      url.searchParams.append("key", key);
      url.searchParams.append("q", q);
      url.searchParams.append("page", page.toString());
      url.searchParams.append("image_type", type);
      url.searchParams.append("category", category);
      url.searchParams.append("colors", colors);
      url.searchParams.append("editors_choice", editors_choice.toString());

      const response = await fetch(url.toString());

      if (!response.ok) {
        serverError(res, "Error fetching data from Pixabay");
        return;
      }

      const data = await response.json();

      const final: IPixabaySearchResult = {
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

      successWithBaseResponse(res, final);
    },
  ),
);

export default router;
