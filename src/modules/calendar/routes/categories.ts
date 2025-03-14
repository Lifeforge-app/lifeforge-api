import express from "express";
import {
  validateCategoryData,
  validateId,
} from "../middlewares/categoriesValidation";
import * as CategoriesController from "../controllers/categoriesController";
import validationMiddleware from "../../../middleware/validationMiddleware";

const router = express.Router();

/**
 * @protected
 * @summary Get all calendar categories
 * @description Retrieve all calendar categories
 * @response 200 (ICalendarCategory[]) - The list of calendar categories
 */
router.get("/", CategoriesController.getAllCategories);

/**
 * @protected
 * @summary Get a specific calendar category by ID
 * @description Retrieve a specific calendar category by its ID
 * @param id (string, required, must_exist) - The ID of the calendar category
 * @response 200 (ICalendarCategory) - The calendar category
 */
router.get(
  "/:id",
  validateId,
  validationMiddleware,
  CategoriesController.getCategoryById
);

/**
 * @protected
 * @summary Create a new calendar category
 * @description Create a new calendar category with name, icon, and color
 * @body name (string, required) - The name of the category
 * @body icon (string, required) - The icon of the category, can be any icon available in Iconify
 * @body color (string, required) - The color of the category, in hex format
 * @response 201 (ICalendarCategory) - The created calendar category
 */
router.post(
  "/",
  validateCategoryData,
  validationMiddleware,
  CategoriesController.createCategory
);

/**
 * @protected
 * @summary Update a calendar category
 * @description Update an existing calendar category with the given ID
 * @param id (string, required, must_exist) - The ID of the calendar category to update
 * @body name (string, required) - The name of the category
 * @body icon (string, required) - The icon of the category, can be any icon available in Iconify
 * @body color (string, required) - The color of the category, in hex format
 * @response 200 (ICalendarCategory) - The updated calendar category
 */
router.patch(
  "/:id",
  validateId,
  validateCategoryData,
  validationMiddleware,
  CategoriesController.updateCategory
);

/**
 * @protected
 * @summary Delete a calendar category
 * @description Delete an existing calendar category with the given ID
 * @param id (string, required, must_exist) - The ID of the calendar category to delete
 * @response 204 - The calendar category was deleted successfully
 */
router.delete(
  "/:id",
  validateId,
  validationMiddleware,
  CategoriesController.deleteCategory
);

export default router;
