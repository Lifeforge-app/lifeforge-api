import express from "express";
import validationMiddleware from "../../../middleware/validationMiddleware";
import * as prioritiesController from "../controllers/prioritiesController";
import { createOrUpdatePriorityValidation } from "../middlewares/prioritiesValidation";

const router = express.Router();

/**
 * @protected
 * @summary Get a list of all todo priorities
 * @description Retrieve a list of all todo priorities.
 * @response 200 (ITodoPriority[]) - The list of todo priorities
 */
router.get("/", prioritiesController.getAllPriorities);

/**
 * @protected
 * @summary Create a new todo priority
 * @description Create a new todo priority with the given name and color.
 * @body name (string, required) - The name of the priority
 * @body color (string, required) - The color of the priority, in hex format
 * @response 201 (ITodoPriority) - The created todo priority
 */
router.post(
  "/",
  createOrUpdatePriorityValidation,
  validationMiddleware,
  prioritiesController.createPriority,
);

/**
 * @protected
 * @summary Update a todo priority
 * @description Update a todo priority with the given ID with the given name and color.
 * @param id (string, required, must_exist) - The ID of the todo priority
 * @body name (string, required) - The name of the priority
 * @body color (string, required) - The color of the priority, in hex format
 * @response 200 (ITodoPriority) - The updated todo priority
 */
router.patch(
  "/:id",
  createOrUpdatePriorityValidation,
  validationMiddleware,
  prioritiesController.updatePriority,
);

/**
 * @protected
 * @summary Delete a todo priority
 * @description Delete a todo priority with the given ID.
 * @param id (string, required, must_exist) - The ID of the todo priority
 * @response 204 - The todo priority was successfully deleted
 */
router.delete("/:id", prioritiesController.deletePriority);

export default router;
