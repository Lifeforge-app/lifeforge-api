import express from "express";
import { body, param } from "express-validator";
import asyncWrapper from "../../../utils/asyncWrapper.js";
import hasError from "../../../utils/checkError.js";
import { getAPIKey } from "../../../utils/getAPIKey.js";
import { clientError, serverError, success } from "../../../utils/response.js";
import scrapeShopee from "../scrapers/shopee.js";
import { singleUploadMiddleware } from "../../../middleware/uploadMiddleware.js";
import { IWishlistEntry } from "../../../interfaces/wishlist_interfaces.js";
import { WithoutPBDefault } from "../../../interfaces/pocketbase_interfaces.js";
import { list } from "../../../utils/CRUD.js";
import {
  checkExistence,
  validateExistence,
} from "../../../utils/PBRecordValidator.js";

const router = express.Router();

router.get(
  "/collection-id",
  asyncWrapper(async (req, res) => {
    const { pb } = req;

    success(res, pb.collection("wishlist_entries").collectionIdOrName);
  })
);

router.get(
  "/:id",
  [param("id").isString().isLength({ min: 1 }).trim()],
  asyncWrapper(async (req, res) => {
    if (hasError(req, res)) return;
    const { id } = req.params;

    if (!(await checkExistence(req, res, "wishlist_lists", id, "id"))) return;

    list(req, res, "wishlist_entries", {
      filter: `list = "${id}"`,
    });
  })
);

router.post(
  "/",
  singleUploadMiddleware,
  [
    body("name").isString().isLength({ min: 1 }).trim(),
    body("url").isString().optional().trim(),
    body("price").isNumeric(),
    body("image").isString().optional().trim(),
    body("list").custom(
      async (value: string, meta) =>
        await validateExistence(meta.req.pb, "wishlist_lists", value)
    ),
  ],
  asyncWrapper(async (req, res) => {
    if (hasError(req, res)) return;

    try {
      const { name, url, price, list } = req.body;
      const { pb } = req;

      const finalData: Omit<WithoutPBDefault<IWishlistEntry>, "image"> & {
        image?: File;
      } = {
        name,
        url,
        price,
        list,
      };

      if (req.file) {
        finalData.image = new File([req.file.buffer], req.file.originalname);
      } else {
        if (!req.body.image) {
          clientError(res, "Image is required");
          return;
        }

        const { image } = req.body;

        const response = await fetch(image);
        const fileBuffer = await response.arrayBuffer();
        finalData.image = new File(
          [new Uint8Array(fileBuffer)],
          image.split("/").pop()
        );
      }

      const entry = await pb
        .collection("wishlist_entries")
        .create<IWishlistEntry>(finalData);

      success(res, entry);
    } catch (e) {
      console.error(e);
      serverError(res, "Error creating entry");
      return;
    }
  })
);

router.post(
  "/external",
  [
    body("provider").isString().isIn(["shopee", "lazada"]),
    body("url").isString().isLength({ min: 1 }).trim(),
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
