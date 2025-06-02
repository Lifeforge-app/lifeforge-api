import express from "express";

import asyncWrapper from "../../../utils/asyncWrapper";
import * as entriesController from "../controllers/entries.controller";
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
  asyncWrapper(entriesController.getAllEntries),
);

router.get(
  "/check",
  checkKeysValidation,
  asyncWrapper(entriesController.checkKeys),
);

router.get(
  "/:id",
  getEntryByIdValidation,
  asyncWrapper(entriesController.getEntryById),
);

router.post(
  "/",
  createEntryValidation,
  asyncWrapper(entriesController.createEntry),
);

router.patch(
  "/:id",
  updateEntryValidation,
  asyncWrapper(entriesController.updateEntry),
);

router.delete(
  "/:id",
  deleteEntryValidation,
  asyncWrapper(entriesController.deleteEntry),
);

export default router;
