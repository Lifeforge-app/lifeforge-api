import express from "express";
import validationMiddleware from "../../../middleware/validationMiddleware";
import * as CategoriesController from "../controllers/categoriesController";
import { validateBodyData, validateId } from "../middlewares/assetsValidation";
import { validateType } from "../middlewares/categoriesValidation";

const router = express.Router();

/**
 * @protected
 * @summary Get a list of all wallet categories
 * @description Retrieve a list of all wallet categories.
 * @response 200 (IWalletCategory[]) - The list of wallet categories
 */
router.get("/", CategoriesController.getAllCategories);

/**
 * @protected
 * @summary Create a new wallet category
 * @description Create a new wallet category with the given name, icon, color, and type.
 * @body name (string, required) - The name of the category
 * @body icon (string, required) - The icon of the category, can be any icon available in Iconify
 * @body color (string, required) - The color of the category, in hex format
 * @body type (string, required, one_of expenses|income) - The type of the category
 * @response 201 (IWalletCategory) - The created wallet category
 */
router.post(
  "/",
  validateType,
  validateBodyData,
  validationMiddleware,
  CategoriesController.createCategory,
);

/**
 * @protected
 * @summary Update a wallet category
 * @description Update a wallet category with the given name, icon, and color.
 * @param id (string, required, must_exist) - The ID of the wallet category
 * @body name (string, required) - The name of the category
 * @body icon (string, required) - The icon of the category, can be any icon available in Iconify
 * @body color (string, required) - The color of the category, in hex format
 * @response 200 (IWalletCategory) - The updated wallet category
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
 * @summary Delete a wallet category
 * @description Delete a wallet category with the given ID.
 * @param id (string, required, must_exist) - The ID of the wallet category
 * @response 204 - The wallet category was successfully deleted
 */
router.delete(
  "/:id",
  validateId,
  validationMiddleware,
  CategoriesController.deleteCategory,
);

export default router;
