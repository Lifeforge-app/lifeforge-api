import asyncWrapper from "@utils/asyncWrapper";
import express from "express";
import * as EntriesController from "../controllers/entries.controller";
import {
  validateEntryId,
  validateTMDBId,
} from "../middlewares/entriesValidation";

const router = express.Router();

router.get("/", asyncWrapper(EntriesController.getAllEntries));

router.post(
  "/:id",
  validateTMDBId,
  asyncWrapper(EntriesController.createEntryFromTMDB),
);

router.delete(
  "/:id",
  validateEntryId,

  asyncWrapper(EntriesController.deleteEntry),
);

export default router;
