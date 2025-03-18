import asyncWrapper from "@utils/asyncWrapper";
import express from "express";
import * as EntriesController from "../controllers/entries.controller";
import {
  validateEntryId,
  validateMusicUpdate,
} from "../middlewares/validation";

const router = express.Router();

router.get("/", asyncWrapper(EntriesController.getAllEntries));

router.get("/import-status", asyncWrapper(EntriesController.getImportStatus));

router.post("/import", asyncWrapper(EntriesController.importMusicFromNAS));

router.patch(
  "/:id",
  validateMusicUpdate,
  asyncWrapper(EntriesController.updateEntry),
);

router.delete(
  "/:id",
  validateEntryId,
  asyncWrapper(EntriesController.deleteEntry),
);

router.post(
  "/favourite/:id",
  validateEntryId,
  asyncWrapper(EntriesController.toggleFavorite),
);

export default router;
