import express from "express";
import asyncWrapper from "../../../core/utils/asyncWrapper";
import * as EntriesController from "../controllers/entries.controller";
import { validateBodyData, validateId } from "../middlewares/entriesValidation";

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

router.delete("/:id", validateId, asyncWrapper(EntriesController.deleteEntry));

export default router;
