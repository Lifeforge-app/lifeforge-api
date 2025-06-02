import express from "express";
import multer from "multer";

import asyncWrapper from "@utils/asyncWrapper";

import * as ideasController from "../controllers/ideas.controller";
import {
  validateArchiveIdea,
  validateCreateIdea,
  validateDeleteIdea,
  validateGetIdeas,
  validateMoveIdea,
  validatePinIdea,
  validateRemoveFromFolder,
  validateUpdateIdea,
} from "../middleware/ideasValidation";

const router = express.Router();

router.get(
  "/:container/*",
  validateGetIdeas,
  asyncWrapper(ideasController.getIdeas),
);

router.post(
  "/",
  multer().single("image") as any,
  validateCreateIdea,
  asyncWrapper(ideasController.createIdea),
);

router.patch(
  "/:id",
  validateUpdateIdea,
  asyncWrapper(ideasController.updateIdea),
);

router.delete(
  "/:id",
  validateDeleteIdea,
  asyncWrapper(ideasController.deleteIdea),
);

router.post("/pin/:id", validatePinIdea, asyncWrapper(ideasController.pinIdea));

router.post(
  "/archive/:id",
  validateArchiveIdea,
  asyncWrapper(ideasController.archiveIdea),
);

router.post(
  "/move/:id",
  validateMoveIdea,
  asyncWrapper(ideasController.moveIdea),
);

router.delete(
  "/move/:id",
  validateRemoveFromFolder,
  asyncWrapper(ideasController.removeFromFolder),
);

export default router;
