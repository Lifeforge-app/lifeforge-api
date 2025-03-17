import express from "express";
import asyncWrapper from "../../../core/utils/asyncWrapper";
import * as tagsController from "../controllers/tags.controller";
import {
  validateCreateTag,
  validateDeleteTag,
  validateGetTags,
  validateUpdateTag,
} from "../middleware/tagsValidation";

const router = express.Router();

router.get(
  "/:container",
  validateGetTags,
  asyncWrapper(tagsController.getTags),
);

router.post(
  "/:container",
  validateCreateTag,
  asyncWrapper(tagsController.createTag),
);

router.patch("/:id", validateUpdateTag, asyncWrapper(tagsController.updateTag));

router.delete(
  "/:id",
  validateDeleteTag,
  asyncWrapper(tagsController.deleteTag),
);

export default router;
