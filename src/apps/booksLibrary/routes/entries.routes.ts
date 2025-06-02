import express from "express";

import asyncWrapper from "@utils/asyncWrapper";

import * as EntriesController from "../controllers/entries.controller";
import {
  validateBodyData,
  validateBodyEmail,
  validateId,
} from "../middlewares/entriesValidation";

const router = express.Router();

router.get("/", asyncWrapper(EntriesController.getAllEntries));

router.patch(
  "/:id",
  validateId,
  validateBodyData,
  asyncWrapper(EntriesController.updateEntry),
);

router.post(
  "/favourite/:id",
  validateId,
  asyncWrapper(EntriesController.toggleFavouriteStatus),
);

router.post(
  "/send-to-kindle/:id",
  validateId,
  validateBodyEmail,
  asyncWrapper(EntriesController.sendToKindle),
);

router.delete("/:id", validateId, asyncWrapper(EntriesController.deleteEntry));

export default router;
