import express from "express";

import asyncWrapper from "@utils/asyncWrapper";

import * as prioritiesController from "../controllers/priorities.controller";
import { createOrUpdatePriorityValidation } from "../middlewares/prioritiesValidation";

const router = express.Router();

router.get("/", asyncWrapper(prioritiesController.getAllPriorities));

router.post(
  "/",
  createOrUpdatePriorityValidation,
  asyncWrapper(prioritiesController.createPriority),
);

router.patch(
  "/:id",
  createOrUpdatePriorityValidation,
  asyncWrapper(prioritiesController.updatePriority),
);

router.delete("/:id", asyncWrapper(prioritiesController.deletePriority));

export default router;
