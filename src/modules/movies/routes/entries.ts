import express from "express";
import validationMiddleware from "../../../middleware/validationMiddleware";
import asyncWrapper from "../../../utils/asyncWrapper";
import * as EntriesController from "../controllers/entriesController";
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
