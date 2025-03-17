import express from "express";
import validationMiddleware from "../../../middleware/validationMiddleware";
import asyncWrapper from "../../../utils/asyncWrapper";
import * as tagsController from "../controllers/tagsController";
import {
  validateCreateTag,
  validateDeleteTag,
  validateGetTags,
  validateUpdateTag,
} from "../middleware/tagsValidation";

const router = express.Router();

/**
 * @protected
 * @summary Get a list of all tags
 * @description Retrieve a list of all tags for a specific container.
 * @param container (string, required) - The ID of the container
 * @response 200 (IIdeaBoxTag[]) - The list of tags
 */
router.get(
  "/:container",
  validateGetTags,
  validationMiddleware,
  asyncWrapper(tagsController.getTags),
);

/**
 * @protected
 * @summary Create a new tag
 * @description Create a new tag with the given name, icon, and color.
 * @param container (string, required) - The ID of the container
 * @body name (string, required) - The name of the tag
 * @body icon (string, required) - The icon of the tag, can be any icon available in Iconify
 * @body color (string, required) - The color of the tag
 * @response 201 (IIdeaBoxTag) - The created tag
 */
router.post(
  "/:container",
  validateCreateTag,
  validationMiddleware,
  asyncWrapper(tagsController.createTag),
);

/**
 * @protected
 * @summary Update a tag
 * @description Update a tag with the given name, icon, and color.
 * @param id (string, required, must_exist) - The ID of the tag
 * @body name (string, required) - The name of the tag
 * @body icon (string, required) - The icon of the tag, can be any icon available in Iconify
 * @body color (string, required) - The color of the tag
 * @response 200 (IIdeaBoxTag) - The updated tag
 */
router.patch(
  "/:id",
  validateUpdateTag,
  validationMiddleware,
  asyncWrapper(tagsController.updateTag),
);

/**
 * @protected
 * @summary Delete a tag
 * @description Delete a tag with the given ID.
 * @param id (string, required, must_exist) - The ID of the tag
 * @response 204 - The tag was successfully deleted
 */
router.delete(
  "/:id",
  validateDeleteTag,
  validationMiddleware,
  asyncWrapper(tagsController.deleteTag),
);

export default router;
