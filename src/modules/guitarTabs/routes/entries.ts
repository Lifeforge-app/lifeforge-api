import express from "express";
import { uploadMiddleware } from "../../../middleware/uploadMiddleware";
import validationMiddleware from "../../../middleware/validationMiddleware";
import asyncWrapper from "../../../utils/asyncWrapper";
import * as entriesController from "../controllers/entriesController";
import {
  validateDeleteEntry,
  validateGetEntries,
  validateToggleFavorite,
  validateUpdateEntry,
} from "../middleware/validationMiddleware";

const router = express.Router();

router.get("/sidebar-data", asyncWrapper(entriesController.getSidebarData));

router.get(
  "/",
  validateGetEntries,
  validationMiddleware,
  asyncWrapper(entriesController.getEntries),
);

router.post(
  "/upload",
  uploadMiddleware,
  asyncWrapper(entriesController.uploadFiles),
);

router.get("/process-status", asyncWrapper(entriesController.getProcessStatus));

router.patch(
  "/:id",
  validateUpdateEntry,
  validationMiddleware,
  asyncWrapper(entriesController.updateEntry),
);

router.delete(
  "/:id",
  validateDeleteEntry,
  validationMiddleware,
  asyncWrapper(entriesController.deleteEntry),
);

router.get("/download-all", asyncWrapper(entriesController.downloadAllEntries));

router.post(
  "/favourite/:id",
  validateToggleFavorite,
  validationMiddleware,
  asyncWrapper(entriesController.toggleFavorite),
);

export default router;
