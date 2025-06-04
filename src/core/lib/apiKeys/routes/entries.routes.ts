import express from "express";

import asyncWrapper from "../../../utils/asyncWrapper";
import * as EntriesController from "../controllers/entries.controller";
import {
  checkKeysValidation,
  createEntryValidation,
  deleteEntryValidation,
  getEntriesValidation,
  getEntryByIdValidation,
  updateEntryValidation,
} from "../middlewares/entriesValidation";

const router = express.Router();

router.get(
  "/",
  getEntriesValidation,
  asyncWrapper(EntriesController.getAllEntries),
);

router.get(
  "/check",
  checkKeysValidation,
  asyncWrapper(EntriesController.checkKeys),
);

router.get(
  "/:id",
  getEntryByIdValidation,
  asyncWrapper(EntriesController.getEntryById),
);

router.post(
  "/",
  createEntryValidation,
  asyncWrapper(EntriesController.createEntry),
);

router.patch(
  "/:id",
  updateEntryValidation,
  asyncWrapper(EntriesController.updateEntry),
);

router.delete(
  "/:id",
  deleteEntryValidation,
  asyncWrapper(EntriesController.deleteEntry),
);

export default router;
