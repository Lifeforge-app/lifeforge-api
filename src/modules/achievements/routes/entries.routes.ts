import express from "express";
import asyncWrapper from "../../../core/utils/asyncWrapper";
import * as EntriesController from "../controllers/entries.controller";
import {
  validateBodyData,
  validateDifficulty,
  validateId,
} from "../middlewares/entriesValidation";

const router = express.Router();

router.get(
  "/:difficulty",
  validateDifficulty,
  asyncWrapper(EntriesController.getAllEntriesByDifficulty),
);

router.post("/", validateBodyData, asyncWrapper(EntriesController.createEntry));

router.patch(
  "/:id",
  validateId,
  validateBodyData,
  asyncWrapper(EntriesController.updateEntry),
);

router.delete("/:id", validateId, asyncWrapper(EntriesController.deleteEntry));

export default router;
