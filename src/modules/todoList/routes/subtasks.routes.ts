import express from "express";
import * as subtasksController from "../controllers/subtasks.controller";
import { validateGenerateSubtasks } from "../middlewares/subtasksValidation";

const router = express.Router();

/**
 * @protected
 * @summary Get a list of all subtasks for a todo list entry
 * @description Retrieve a list of all subtasks for a todo list entry.
 * @param id (string, required, must_exist) - The ID of the todo list entry
 * @response 200 (ITodoSubtask[]) - The list of subtasks
 */
router.get("/list/:id", subtasksController.getSubtasks);

/**
 * @protected
 * @summary Get a list of subtasks for a todo list entry
 * @description Use Groq to generate a list of suggested relevant subtasks for a given task.
 * @body summary (string, required) - The summary of the task
 * @body notes (string, optional) - The notes of the task
 * @body level (number, required, one_of 0|1|2|3|4) - The level of breakdown for the subtasks, the higher the number, the more amount of subtasks generated
 * @response 200 (string[]) - The list of subtasks
 */
router.post(
  "/ai-generate",
  validateGenerateSubtasks,
  subtasksController.generateSubtasks,
);

/**
 * @protected
 * @summary Toggle the completion status of a subtask
 * @description Mark a subtask as done or not done, toggling the completion status.
 * @param id (string, required, must_exist) - The ID of the todo list entry
 * @body content (string, required) - The content of the subtask
 * @response 201 (ITodoSubtask) - The updated subtask
 */
router.patch("/toggle/:id", subtasksController.toggleSubtask);

export default router;
