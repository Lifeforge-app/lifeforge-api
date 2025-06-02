import express from "express";

import { singleUploadMiddleware } from "@middlewares/uploadMiddleware";

import asyncWrapper from "@utils/asyncWrapper";

import * as entriesController from "../controllers/entries.controller";
import {
  validateBoughtQuery,
  validateEntryData,
  validateEntryId,
  validateExternalData,
  validateListId,
} from "../middlewares/entriesValidation";

const router = express.Router();

router.get("/collection-id", asyncWrapper(entriesController.getCollectionId));

router.get(
  "/:id",
  validateListId,
  validateBoughtQuery,
  asyncWrapper(entriesController.getEntriesByListId),
);

router.post(
  "/external",
  validateExternalData,
  asyncWrapper(entriesController.scrapeExternal),
);

router.post(
  "/",
  singleUploadMiddleware,
  validateEntryData,
  asyncWrapper(entriesController.createEntry),
);

router.patch(
  "/:id",
  singleUploadMiddleware,
  validateEntryId,
  asyncWrapper(entriesController.updateEntry),
);

router.patch(
  "/bought/:id",
  validateEntryId,
  asyncWrapper(entriesController.updateEntryBoughtStatus),
);

router.delete(
  "/:id",
  validateEntryId,
  asyncWrapper(entriesController.deleteEntry),
);

export default router;
