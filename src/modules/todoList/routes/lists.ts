import express from "express";
import * as listsController from "../controllers/listsController";
import { createOrUpdateListValidation } from "../middlewares/listsValidation";

const router = express.Router();

/**
 * @protected
 * @summary Get a list of all todo lists
 * @description Retrieve a list of all todo lists.
 * @response 200 (ITodoListList[]) - The list of todo lists
 */
router.get("/", listsController.getAllLists);

/**
 * @protected
 * @summary Create a new todo list
 * @description Create a new todo list with the given name, icon, and color.
 * @body name (string, required) - The name of the list
 * @body icon (string, required) - The icon of the list, can be any icon available in Iconify
 * @body color (string, required) - The color of the list, in hex format
 * @response 201 (ITodoListList) - The created todo list
 */
router.post("/", createOrUpdateListValidation, listsController.createList);

/**
 * @protected
 * @summary Update a todo list
 * @description Update a todo list with the given name, icon, and color.
 * @param id (string, required, must_exist) - The ID of the list
 * @body name (string, required) - The name of the list
 * @body icon (string, required) - The icon of the list, can be any icon available in Iconify
 * @body color (string, required) - The color of the list, in hex format
 * @response 200 (ITodoListList) - The updated todo list
 */
router.patch("/:id", createOrUpdateListValidation, listsController.updateList);

/**
 * @protected
 * @summary Delete a todo list
 * @description Delete a todo list with the given ID.
 * @param id (string, required, must_exist) - The ID of the list
 * @response 204 - The todo list was successfully deleted
 */
router.delete("/:id", listsController.deleteList);

export default router;
