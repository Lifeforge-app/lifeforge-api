import express from "express";
import validationMiddleware from "../../../core/middleware/validationMiddleware";
import * as CategoriesController from "../controllers/categories.controller";
import {
  validateBodyData,
  validateId,
} from "../middlewares/categoriesValidation";

const router = express.Router();

/**
 * @protected
 * @summary Get a list of all book categories
 * @description Retrieve a list of all book categories.
 * @response 200 (IBooksLibraryCategory[]) - The list of book categories
 */
router.get("/", CategoriesController.getAllCategories);

/**
 * @protected
 * @summary Create a new book category
 * @description Create a new pribook category with the given name and icon.
 * @body name (string, required) - The name of the category
 * @body icon (string, required) - The icon of the category, can be any icon available in Iconify
 * @response 201 (IBooksLibraryCategory) - The created book category
 */
router.post(
  "/",
  validateBodyData,
  validationMiddleware,
  CategoriesController.createCategory,
);

/**
 * @protected
 * @summary Update a book category
 * @description Update a book category with the given name and icon.
 * @param id (string, required, must_exist) - The ID of the book category
 * @body name (string, required) - The name of the category
 * @body icon (string, required) - The icon of the category, can be any icon available in Iconify
 * @response 200 (IProjectsMCategory) - The updated book category
 */
router.patch(
  "/:id",
  validateId,
  validateBodyData,
  validationMiddleware,
  CategoriesController.updateCategory,
);

/**
 * @protected
 * @summary Delete a book category
 * @description Delete a book category with the given ID.
 * @param id (string, required, must_exist) - The ID of the book category
 * @response 204 - The book category was successfully deleted
 */
router.delete(
  "/:id",
  validateId,
  validationMiddleware,
  CategoriesController.deleteCategory,
);

export default router;
