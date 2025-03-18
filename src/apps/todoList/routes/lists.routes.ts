import express from "express";
import asyncWrapper from "../../../core/utils/asyncWrapper";
import * as listsController from "../controllers/lists.controller";
import { createOrUpdateListValidation } from "../middlewares/listsValidation";

const router = express.Router();

router.get("/", asyncWrapper(listsController.getAllLists));

router.post(
  "/",
  createOrUpdateListValidation,
  asyncWrapper(listsController.createList),
);

router.patch(
  "/:id",
  createOrUpdateListValidation,
  asyncWrapper(listsController.updateList),
);

router.delete("/:id", asyncWrapper(listsController.deleteList));

export default router;
