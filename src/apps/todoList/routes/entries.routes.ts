import express from "express";

import asyncWrapper from "@utils/asyncWrapper";

import * as entriesController from "../controllers/entries.controller";
import {
  createEntryValidation,
  getEntriesValidation,
  updateEntryValidation,
} from "../middlewares/entriesValidation";

const router = express.Router();

router.get(
  "/",
  getEntriesValidation,
  asyncWrapper(entriesController.getAllEntries),
);

router.get("/status-counter", asyncWrapper(entriesController.getStatusCounter));

router.get("/:id", asyncWrapper(entriesController.getEntryById));

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

router.delete("/:id", asyncWrapper(entriesController.deleteEntry));

router.post("/toggle/:id", asyncWrapper(entriesController.toggleEntry));

export default router;
