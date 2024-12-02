import express from "express";
import { body } from "express-validator";
import asyncWrapper from "../../../utils/asyncWrapper.js";
import hasError from "../../../utils/checkError.js";
import { getAPIKey } from "../../../utils/getAPIKey.js";
import { clientError, success } from "../../../utils/response.js";
import scrapeShopee from "../scrapers/shopee.js";

const router = express.Router();

router.post(
  "/external",
  [
    body("provider").isString().isIn(["shopee", "lazada"]),
    body("url").isString().isLength({ min: 1 }),
  ],
  asyncWrapper(async (req, res) => {
    if (hasError(req, res)) return;
    const key = await getAPIKey("groq", req.pb);

    if (!key) {
      clientError(res, "API key not found");
      return;
    }

    const { url, provider } = req.body;

    switch (provider) {
      case "shopee":
        const result = await scrapeShopee(url, key);

        if (!result) {
          clientError(res, "Error scraping Shopee");
          return;
        }

        success(res, result);
        break;
      case "lazada":
        success(res, "Lazada not implemented");
        break;
    }
  })
);

export default router;
