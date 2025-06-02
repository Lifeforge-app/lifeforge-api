import express from "express";

import asyncWrapper from "@utils/asyncWrapper";

import * as CategoriesController from "../controllers/categories.controller";

const router = express.Router();

router.get("/", asyncWrapper(CategoriesController.getAllCategories));

router.post("/", asyncWrapper(CategoriesController.createCategory));

router.patch("/:id", asyncWrapper(CategoriesController.updateCategory));

router.delete("/:id", asyncWrapper(CategoriesController.deleteCategory));

export default router;
