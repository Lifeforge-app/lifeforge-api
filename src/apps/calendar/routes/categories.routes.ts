import express from "express";

import asyncWrapper from "@utils/asyncWrapper";

import * as CategoriesController from "../controllers/categories.controller";
import {
  validateCategoryData,
  validateId,
} from "../middlewares/categoriesValidation";

const router = express.Router();

router.get("/", asyncWrapper(CategoriesController.getAllCategories));

router.get(
  "/:id",
  validateId,
  asyncWrapper(CategoriesController.getCategoryById),
);

router.post(
  "/",
  validateCategoryData,
  asyncWrapper(CategoriesController.createCategory),
);

router.patch(
  "/:id",
  validateId,
  validateCategoryData,
  asyncWrapper(CategoriesController.updateCategory),
);

router.delete(
  "/:id",
  validateId,
  asyncWrapper(CategoriesController.deleteCategory),
);

export default router;
