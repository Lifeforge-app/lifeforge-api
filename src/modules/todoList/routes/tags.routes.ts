import express from "express";
import asyncWrapper from "../../../core/utils/asyncWrapper";
import * as tagsController from "../controllers/tags.controller";
import { createOrUpdateTagValidation } from "../middlewares/tagsValidation";

const router = express.Router();

router.get("/", asyncWrapper(tagsController.getAllTags));

router.post(
  "/",
  createOrUpdateTagValidation,
  asyncWrapper(tagsController.createTag),
);

router.patch(
  "/:id",
  createOrUpdateTagValidation,
  asyncWrapper(tagsController.updateTag),
);

router.delete("/:id", asyncWrapper(tagsController.deleteTag));

export default router;
