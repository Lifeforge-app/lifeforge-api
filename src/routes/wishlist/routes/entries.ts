import express from "express";
import { body, param, query } from "express-validator";
import asyncWrapper from "../../../utils/asyncWrapper.js";
import hasError from "../../../utils/checkError.js";
import { getAPIKey } from "../../../utils/getAPIKey.js";
import { clientError, serverError, success } from "../../../utils/response.js";
import scrapeProviders from "../scrapers/index.js";
import { singleUploadMiddleware } from "../../../middleware/uploadMiddleware.js";
import { IWishlistEntry } from "../../../interfaces/wishlist_interfaces.js";
import { WithoutPBDefault } from "../../../interfaces/pocketbase_interfaces.js";
import { list } from "../../../utils/CRUD.js";
import { checkExistence } from "../../../utils/PBRecordValidator.js";
import fs from "fs";

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
  [
    param("id").isString().isLength({ min: 1 }).trim(),
    query("bought").isBoolean().optional(),
  ],
  asyncWrapper(async (req, res) => {
    if (hasError(req, res)) return;
    const { id } = req.params;

    if (!(await checkExistence(req, res, "wishlist_lists", id, "id"))) return;

    list(req, res, "wishlist_entries", {
      filter: `list = "${id}" ${
        req.query.bought ? `&& bought = ${req.query.bought === "true"}` : ""
      }`,
    });
  })
);

router.post(
  "/external",
  [
    body("provider").isString(),
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

    const result = await scrapeProviders[
      provider as keyof typeof scrapeProviders
    ]?.(url, key);

    if (!result) {
      clientError(res, "Error scraping provider");
      return;
    }

    success(res, result);
  })
);

router.post(
  "/",
  singleUploadMiddleware,
  [
    body("name").isString().isLength({ min: 1 }).trim(),
    body("url").isString().optional().trim(),
    body("price").isNumeric(),
    body("list").isString(),
  ],
  asyncWrapper(async (req, res) => {
    if (hasError(req, res)) return;

    try {
      const { name, url, price, list } = req.body;
      const { pb } = req;

      if (!(await checkExistence(req, res, "wishlist_lists", list, "list"))) {
        return;
      }

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
      } else if (req.body.image) {
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

      await pb.collection("wishlist_lists").update(list, {
        "item_count+": 1,
        "total_amount+": entry.price,
      });

      success(res, entry);
    } catch (e) {
      console.error(e);
      serverError(res, "Error creating entry");
      return;
    }
  })
);

router.patch(
  "/:id",
  singleUploadMiddleware,
  [param("id").isString().isLength({ min: 1 }).trim()],
  asyncWrapper(async (req, res) => {
    if (hasError(req, res)) return;

    const { id } = req.params;

    if (!(await checkExistence(req, res, "wishlist_entries", id, "id"))) return;

    const { list, name, url, price, imageRemoved } = req.body;
    const file = req.file;
    let finalFile: null | File = null;

    if (imageRemoved === "true") {
      finalFile = null;
    }

    if (file) {
      const fileBuffer = fs.readFileSync(file.path);
      finalFile = new File([fileBuffer], file.originalname);
    }

    const oldEntry = await req.pb.collection("wishlist_entries").getOne(id);

    const entry = await req.pb.collection("wishlist_entries").update(id, {
      list,
      name,
      url,
      price,
      ...(imageRemoved === "true" || finalFile ? { image: finalFile } : {}),
    });

    if (oldEntry.list !== list) {
      await req.pb.collection("wishlist_lists").update(oldEntry.list, {
        "item_count-": 1,
        "total_amount-": oldEntry.price,
        "bought_count-": oldEntry.bought ? 1 : 0,
      });

      await req.pb.collection("wishlist_lists").update(list, {
        "item_count+": 1,
        "total_amount+": entry.price,
        "bought_count+": entry.bought ? 1 : 0,
      });
    } else {
      await req.pb.collection("wishlist_lists").update(entry.list, {
        "total_amount+": entry.price - oldEntry.price,
      });
    }

    success(res, oldEntry.list === list ? entry : "removed");
  })
);

router.patch(
  "/bought/:id",
  [param("id").isString().isLength({ min: 1 }).trim()],
  asyncWrapper(async (req, res) => {
    if (hasError(req, res)) return;
    const { id } = req.params;

    if (!(await checkExistence(req, res, "wishlist_entries", id, "id"))) return;

    const oldEntry = await req.pb.collection("wishlist_entries").getOne(id);

    const entry = await req.pb.collection("wishlist_entries").update(id, {
      bought: !oldEntry.bought,
      bought_at: oldEntry.bought ? null : new Date().toISOString(),
    });

    await req.pb.collection("wishlist_lists").update(entry.list, {
      "bought_count+": oldEntry.bought ? -1 : 1,
    });

    success(res, entry);
  })
);

router.delete(
  "/:id",
  [param("id").isString().isLength({ min: 1 }).trim()],
  asyncWrapper(async (req, res) => {
    if (hasError(req, res)) return;
    const { id } = req.params;

    if (!(await checkExistence(req, res, "wishlist_entries", id, "id"))) return;

    const entry = await req.pb.collection("wishlist_entries").getOne(id);

    await req.pb.collection("wishlist_entries").delete(id);

    await req.pb.collection("wishlist_lists").update(entry.list, {
      "item_count-": 1,
      "total_amount-": entry.price,
      "bought_count-": entry.bought ? 1 : 0,
    });

    success(res);
  })
);

export default router;
