import express from "express";
import asyncWrapper from "../../../core/utils/asyncWrapper";
import * as foldersController from "../controllers/folders.controller";
import {
  validateCreateFolder,
  validateDeleteFolder,
  validateGetFolders,
  validateMoveFolder,
  validateRemoveFromFolder,
  validateUpdateFolder,
} from "../middleware/foldersValidation";

const router = express.Router();

router.get(
  "/:container/*",
  validateGetFolders,
  asyncWrapper(foldersController.getFolders),
);

router.post(
  "/",
  validateCreateFolder,
  asyncWrapper(foldersController.createFolder),
);

router.patch(
  "/:id",
  validateUpdateFolder,
  asyncWrapper(foldersController.updateFolder),
);

router.post(
  "/move/:id",
  validateMoveFolder,
  asyncWrapper(foldersController.moveFolder),
);

router.delete(
  "/move/:id",
  validateRemoveFromFolder,
  asyncWrapper(foldersController.removeFromFolder),
);

router.delete(
  "/:id",
  validateDeleteFolder,
  asyncWrapper(foldersController.deleteFolder),
);

export default router;
