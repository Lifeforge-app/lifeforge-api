import express from "express";
import * as tagsController from "../controllers/tagsController";
import { createOrUpdateTagValidation } from "../middlewares/tagsValidation";

const router = express.Router();

/**
 * @protected
 * @summary Get a list of all todo tags
 * @description Retrieve a list of all todo tags.
 * @response 200 (ITodoListTag[]) - The list of todo tags
 */
router.get("/", tagsController.getAllTags);

/**
 * @protected
 * @summary Create a new todo tag
 * @description Create a new todo tag with the given name.
 * @body name (string, required) - The name of the tag
 * @response 201 (ITodoListTag) - The created todo tag
 */
router.post("/", createOrUpdateTagValidation, tagsController.createTag);

/**
 * @protected
 * @summary Update a todo tag
 * @description Update a todo tag with the given name.
 * @param id (string, required, must_exist) - The ID of the tag
 * @body name (string, required) - The name of the tag
 * @response 200 (ITodoListTag) - The updated todo tag
 */
router.patch("/:id", createOrUpdateTagValidation, tagsController.updateTag);

/**
 * @protected
 * @summary Delete a todo tag
 * @description Delete a todo tag with the given ID.
 * @param id (string, required, must_exist) - The ID of the tag
 * @response 204 - The todo tag was deleted successfully
 */
router.delete("/:id", tagsController.deleteTag);

export default router;
