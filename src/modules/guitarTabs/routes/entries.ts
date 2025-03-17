import express from "express";
import { uploadMiddleware } from "../../../middleware/uploadMiddleware";
import validationMiddleware from "../../../middleware/validationMiddleware";
import * as entriesController from "../controllers/entriesController";
import {
  validateDeleteEntry,
  validateGetEntries,
  validateToggleFavorite,
  validateUpdateEntry,
} from "../middleware/entriesValidation";

const router = express.Router();

router.get("/sidebar-data", entriesController.getSidebarData);

router.get(
  "/",
  validateGetEntries,
  validationMiddleware,
  entriesController.getEntries,
);

router.post("/upload", uploadMiddleware, entriesController.uploadFiles);

router.get("/process-status", entriesController.getProcessStatus);

router.patch(
  "/:id",
  validateUpdateEntry,
  validationMiddleware,
  entriesController.updateEntry,
);

router.delete(
  "/:id",
  validateDeleteEntry,
  validationMiddleware,
  entriesController.deleteEntry,
);

router.get("/download-all", entriesController.downloadAllEntries);

router.post(
  "/favourite/:id",
  validateToggleFavorite,
  validationMiddleware,
  entriesController.toggleFavorite,
);

export default router;
