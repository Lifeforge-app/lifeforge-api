import asyncWrapper from "@utils/asyncWrapper";
import express from "express";
import * as listsController from "../controllers/lists.controller";
import {
  validateListData,
  validateListId,
} from "../middlewares/listsValidation";

const router = express.Router();

/**
 * @protected
 * @summary Get a single wishlist list
 * @description Retrieve a single wishlist list by its ID.
 * @param id (string, required) - The ID of the wishlist list
 * @response 200
 */
router.get("/:id", validateListId, asyncWrapper(listsController.getList));

/**
 * @protected
 * @summary Check if an wishlist list exists
 * @description Check if an wishlist list exists by its ID.
 * @param id (string, required) - The ID of the wishlist list
 * @response 200 (boolean) - Whether the wishlist list exists
 */
router.get(
  "/valid/:id",
  validateListId,
  asyncWrapper(listsController.checkListExists),
);

/**
 * @protected
 * @summary Get a list of all wishlist lists
 * @description Retrieve a list of all wishlist lists.
 * @response 200 (IWishlistList[]) - The list of wishlist lists
 */
router.get("/", asyncWrapper(listsController.getAllLists));

/**
 * @protected
 * @summary Create a new wishlist list
 * @description Create a new wishlist list with the given name, color, and icon.
 * @body name (string, required) - The name of the list
 * @body description (string, optional) - The description of the list
 * @body color (string, required) - The color of the list
 * @body icon (string) - The icon of the list
 * @response 201 (IWishlistList) - The created wishlist list
 */
router.post("/", validateListData, asyncWrapper(listsController.createList));

/**
 * @protected
 * @summary Update an wishlist list
 * @description Update an wishlist list with the given name, color, and icon.
 * @param id (string, required) - The ID of the wishlist list
 * @body name (string, required) - The name of the list
 * @body description (string, optional) - The description of the list
 * @body color (string, required) - The color of the list
 * @body icon (string) - The icon of the list
 * @response 200 (IWishlistList) - The updated wishlist list
 */
router.patch(
  "/:id",
  validateListId,
  validateListData,
  asyncWrapper(listsController.updateList),
);

/**
 * @protected
 * @summary Delete an wishlist list
 * @description Delete an wishlist list by its ID.
 * @param id (string, required) - The ID of the wishlist list
 * @response 204
 */
router.delete("/:id", validateListId, asyncWrapper(listsController.deleteList));

export default router;
