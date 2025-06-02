import express from "express";

import asyncWrapper from "@utils/asyncWrapper";

import * as CategoriesController from "../controllers/categories.controller";
import {
  validateBodyData,
  validateId,
} from "../middlewares/categoriesValidation";

const router = express.Router();

router.get("/", asyncWrapper(CategoriesController.getAllCategories));

router.post(
  "/",
  validateBodyData,
  asyncWrapper(CategoriesController.createCategory),
);

router.patch(
  "/:id",
  validateId,
  validateBodyData,
  asyncWrapper(CategoriesController.updateCategory),
);

router.delete(
  "/:id",
  validateId,
  asyncWrapper(CategoriesController.deleteCategory),
);

export default router;
