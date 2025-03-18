import express from "express";
import { uploadMiddleware } from "../../../core/middleware/uploadMiddleware";
import asyncWrapper from "../../../core/utils/asyncWrapper";
import * as entriesController from "../controllers/entries.controller";
import {
  validateDeleteEntry,
  validateGetEntries,
  validateToggleFavorite,
  validateUpdateEntry,
} from "../middleware/entriesValidation";

const router = express.Router();

router.get("/sidebar-data", asyncWrapper(entriesController.getSidebarData));

router.get("/", validateGetEntries, asyncWrapper(entriesController.getEntries));

router.post(
  "/upload",
  uploadMiddleware,
  asyncWrapper(entriesController.uploadFiles),
);

router.get("/process-status", asyncWrapper(entriesController.getProcessStatus));

router.patch(
  "/:id",
  validateUpdateEntry,
  asyncWrapper(entriesController.updateEntry),
);

router.delete(
  "/:id",
  validateDeleteEntry,
  asyncWrapper(entriesController.deleteEntry),
);

router.get("/download-all", asyncWrapper(entriesController.downloadAllEntries));

router.post(
  "/favourite/:id",
  validateToggleFavorite,
  asyncWrapper(entriesController.toggleFavorite),
);

export default router;
