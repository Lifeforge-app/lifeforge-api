import express from "express";
import { body } from "express-validator";
import { singleUploadMiddleware } from "../../../middleware/uploadMiddleware";
import asyncWrapper from "../../../utils/asyncWrapper";
import { successWithBaseResponse, clientError } from "../../../utils/response";
import fs from "fs";

const router = express.Router();

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
            `${req.pb.authStore.record!.id}.${req.file.originalname.split(".").pop()}`
          ),
        });

      successWithBaseResponse(
        res,
        `media/${newEntry.collectionId}/${newEntry.id}/${newEntry.bgImage}`
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
              `${req.pb.authStore.record!.id}.png`
            ),
          });

        successWithBaseResponse(
          res,
          `media/${newEntry.collectionId}/${newEntry.id}/${newEntry.bgImage}`
        );
      })
      .catch(() => {
        clientError(res, "Invalid file");
      });
  })
);

router.delete(
  "/bg-image",
  asyncWrapper(async (req, res) => {
    const { pb } = req;

    await pb.collection("users").update(req.pb.authStore.record!.id, {
      bgImage: null,
    });

    successWithBaseResponse(res);
  })
);

/**
 * @protected
 * @summary Change the personalization settings
 * @description Change the personalization settings of the user.
 * @body data (object, required, one_of fontFamily|theme|color|bgTemp|language|dashboardLayout|backdropFilters) - The personalization settings to update
 * @response 200 - The personalization settings have been updated
 */
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
  })
);

export default router;
