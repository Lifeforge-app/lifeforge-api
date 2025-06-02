import express from "express";

import asyncWrapper from "@utils/asyncWrapper";

import * as listsController from "../controllers/lists.controller";
import {
  validateListData,
  validateListId,
} from "../middlewares/listsValidation";

const router = express.Router();

router.get("/:id", validateListId, asyncWrapper(listsController.getList));

router.get(
  "/valid/:id",
  validateListId,
  asyncWrapper(listsController.checkListExists),
);

router.get("/", asyncWrapper(listsController.getAllLists));

router.post("/", validateListData, asyncWrapper(listsController.createList));

router.patch(
  "/:id",
  validateListId,
  validateListData,
  asyncWrapper(listsController.updateList),
);

router.delete("/:id", validateListId, asyncWrapper(listsController.deleteList));

export default router;
