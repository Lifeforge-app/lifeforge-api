import asyncWrapper from "@utils/asyncWrapper";
import { getAPIKey } from "@utils/getAPIKey";
import { clientError, successWithBaseResponse } from "@utils/response";
import express from "express";
import { body, query } from "express-validator";
import fs from "fs";
import { singleUploadMiddleware } from "../../../core/middleware/uploadMiddleware";

const router = express.Router();

router.get(
  "/fonts",
  asyncWrapper(async (req, res) => {
    const { pb } = req;
    const key = await getAPIKey("gcloud", pb);

    if (!key) {
      successWithBaseResponse(res, {
        enabled: false,
      });
      return;
    }

    const target = `https://www.googleapis.com/webfonts/v1/webfonts?key=${key}`;

    const response = await fetch(target);
    const data = await response.json();

    successWithBaseResponse(res, {
      enabled: true,
      items: data.items,
    });
  }),
);

router.get(
  "/font",
  [query("family").isString()],
  asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { family } = req.query as { family: string };

    const key = await getAPIKey("gcloud", pb);

    if (!key) {
      successWithBaseResponse(res, {
        enabled: false,
      });
      return;
    }

    const target = `https://www.googleapis.com/webfonts/v1/webfonts?family=${family!.replace(
      / /g,
      "+",
    )}&key=${key}`;

    const response = await fetch(target);
    const data = await response.json();

    successWithBaseResponse(res, {
      enabled: true,
      items: data.items,
    });
  }),
);

router.put(
  "/bg-image",
  singleUploadMiddleware,
  asyncWrapper(async (req, res) => {
    const { pb } = req;

    if (req.file) {
      const fileBuffer = fs.readFileSync(req.file.path);

      const newEntry = await pb
        .collection("users")
        .update(req.pb.authStore.record!.id, {
          bgImage: new File(
            [fileBuffer],
            `${req.pb.authStore.record!.id}.${req.file.originalname.split(".").pop()}`,
          ),
        });

      successWithBaseResponse(
        res,
        `media/${newEntry.collectionId}/${newEntry.id}/${newEntry.bgImage}`,
      );
      fs.unlinkSync(req.file.path);

      return;
    }

    if (!req.body.url) {
      clientError(res, "No file uploaded");
      return;
    }

    const { url } = req.body;
    fetch(url)
      .then(async (response) => {
        const fileBuffer = await response.arrayBuffer();
        const newEntry = await pb
          .collection("users")
          .update(req.pb.authStore.record!.id, {
            bgImage: new File(
              [new Uint8Array(fileBuffer)],
              `${req.pb.authStore.record!.id}.png`,
            ),
          });

        successWithBaseResponse(
          res,
          `media/${newEntry.collectionId}/${newEntry.id}/${newEntry.bgImage}`,
        );
      })
      .catch(() => {
        clientError(res, "Invalid file");
      });
  }),
);

router.delete(
  "/bg-image",
  asyncWrapper(async (req, res) => {
    const { pb } = req;

    await pb.collection("users").update(req.pb.authStore.record!.id, {
      bgImage: null,
    });

    successWithBaseResponse(res);
  }),
);

router.patch(
  "/",
  [
    body("data.fontFamily").optional().isString(),
    body("data.theme").optional().isString(),
    body("data.color").optional().isString(),
    body("data.bgTemp").optional().isString(),
    body("data.language").optional().isString(),
    body("data.dashboardLayout").optional().isString(),
    body("data.backdropFilters").optional().isObject(),
  ],
  asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { data } = req.body;
    const toBeUpdated: { [key: string]: any } = {};

    for (let item of [
      "fontFamily",
      "theme",
      "color",
      "bgTemp",
      "language",
      "dashboardLayout",
      "backdropFilters",
    ]) {
      if (data[item]) {
        toBeUpdated[item] = data[item];
      }
    }

    if (!Object.keys(toBeUpdated).length) {
      throw new Error("No data to update");
    }

    await pb
      .collection("users")
      .update(req.pb.authStore.record!.id, toBeUpdated);

    successWithBaseResponse(res);
  }),
);

export default router;
