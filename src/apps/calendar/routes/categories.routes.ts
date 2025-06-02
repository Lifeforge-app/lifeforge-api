import express from "express";

import * as CategoriesController from "../controllers/categories.controller";

const router = express.Router();

router.get("/", CategoriesController.getAllCategories);

router.get("/:id", CategoriesController.getCategoryById);

router.post("/", CategoriesController.createCategory);

router.patch("/:id", CategoriesController.updateCategory);

router.delete("/:id", CategoriesController.deleteCategory);

export default router;
