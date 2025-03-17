import asyncWrapper from "@utils/asyncWrapper";
import express from "express";
import validationMiddleware from "../../../core/middleware/validationMiddleware";
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
  validationMiddleware,
  asyncWrapper(EntriesController.createEntryFromTMDB),
);

router.delete(
  "/:id",
  validateEntryId,
  validationMiddleware,
  asyncWrapper(EntriesController.deleteEntry),
);

export default router;
