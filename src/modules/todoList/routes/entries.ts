import express from "express";
import * as entriesController from "../controllers/entriesController";
import {
  createEntryValidation,
  getEntriesValidation,
  updateEntryValidation,
} from "../middlewares/entriesValidation";

const router = express.Router();

/**
 * @protected
 * @summary Get a list of all todo list entries
 * @description Retrieve a list of all todo list entries, filtered by status, tag, list, and priority given in the query.
 * @query status (string, optional, one_of all|today|scheduled|overdue|completed) - The status of the todo list entry
 * @query tag (string, optional, must_exist) - The tag of the todo list entry
 * @query list (string, optional, must_exist) - The list of the todo list entry
 * @query priority (string, optional, must_exist) - The priority of the todo list entry
 * @response 200 (ITodoListEntry[]) - The list of todo list entries
 */
router.get("/", getEntriesValidation, entriesController.getAllEntries);

/**
 * @protected
 * @summary Get the amount of todo list entries in each status
 * @description Retrieve the amount of todo list entries in each status.
 * @response 200 (ITodoListStatusCounter) - The amount of todo list entries in each status
 */
router.get("/status-counter", entriesController.getStatusCounter);

/**
 * @protected
 * @summary Create a new todo list entry
 * @description Create a new todo list entry with the given title, description, due date, list, priority, tags, and subtasks.
 * @body summary (string, required) - The title of the todo list entry
 * @body notes (string, required) - The description of the todo list entry
 * @body due_date (string, required) - The due date of the todo list entry, in any format that can be parsed by moment.js
 * @body list (string, required, must_exist) - The list of the todo list entry
 * @body priority (string, required, must_exist) - The priority of the todo list entry
 * @body tags (string[], required, must_exist) - The tags of the todo list entry
 * @body subtasks (ITodoSubtask[], required) - The subtasks of the todo list entry
 * @response 201 (ITodoListEntry) - The created todo list entry
 */
router.post("/", createEntryValidation, entriesController.createEntry);

/**
 * @protected
 * @summary Update a todo list entry
 * @description Update a todo list entry with the given title, description, due date, list, priority, tags, and subtasks.
 * @param id (string, required, must_exist) - The ID of the todo list entry
 * @body summary (string, required) - The title of the todo list entry
 * @body notes (string, required) - The description of the todo list entry
 * @body due_date (string, required) - The due date of the todo list entry, in any format that can be parsed by moment.js
 * @body list (string, required, must_exist) - The list of the todo list entry
 * @body priority (string, required, must_exist) - The priority of the todo list entry
 * @body tags (string[], required, must_exist) - The tags of the todo list entry
 * @body subtasks (ITodoSubtask[], required) - The subtasks of the todo list entry
 * @response 200 (ITodoListEntry) - The updated todo list entry
 */
router.patch("/:id", updateEntryValidation, entriesController.updateEntry);

/**
 * @protected
 * @summary Delete a todo list entry
 * @description Delete a todo list entry with the given ID.
 * @param id (string, required, must_exist) - The ID of the todo list entry
 * @response 204 - The todo list entry was successfully deleted
 */
router.delete("/:id", entriesController.deleteEntry);

/**
 * @protected
 * @summary Toggle a todo list entry
 * @description Toggle the done status of a todo list entry with the given ID.
 * @param id (string, required, must_exist) - The ID of the todo list entry
 * @response 200 (ITodoListEntry) - The updated todo list entry
 */
router.post("/toggle/:id", entriesController.toggleEntry);

export default router;
