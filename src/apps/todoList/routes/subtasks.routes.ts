import express from "express";
import asyncWrapper from "../../../core/utils/asyncWrapper";
import * as subtasksController from "../controllers/subtasks.controller";
import { validateGenerateSubtasks } from "../middlewares/subtasksValidation";

const router = express.Router();

router.get("/list/:id", asyncWrapper(subtasksController.getSubtasks));

router.post(
  "/ai-generate",
  validateGenerateSubtasks,
  asyncWrapper(subtasksController.generateSubtasks),
);

router.patch("/toggle/:id", asyncWrapper(subtasksController.toggleSubtask));

export default router;
