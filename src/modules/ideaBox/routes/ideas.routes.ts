import express from "express";
import multer from "multer";
import validationMiddleware from "../../../core/middleware/validationMiddleware";
import * as ideasController from "../controllers/ideas.controller";
import {
  validateArchiveIdea,
  validateCreateIdea,
  validateDeleteIdea,
  validateGetIdeas,
  validateMoveIdea,
  validatePinIdea,
  validateRemoveFromFolder,
  validateUpdateIdea,
} from "../middleware/ideasValidation";

const router = express.Router();

/**
 * @protected
 * @summary Get a list of all idea box entries
 * @description Retrieve a list of all idea box entries, filtered by container and folder given in the URL.
 * @query container (string, required, must_exist) - The container of the idea box entries
 * @query folder (string, optional, must_exist) - The folder of the idea box entries
 * @query archived (boolean, optional) - Whether to include archived entries
 * @response 200 (IIdeaBoxEntry[]) - The list of idea box entries
 */
router.get(
  "/:container/*",
  validateGetIdeas,
  validationMiddleware,
  ideasController.getIdeas,
);

/**
 * @protected
 * @summary Create a new idea box entry
 * @description Create a new idea box entry with the given container, title, content, and type.
 * @body container (string, required, must_exist) - The container of the idea box entry
 * @body type (string, required, one_of text|link|image) - The type of the idea box entry
 * @body title (string, required if type is text or link) - The title of the idea box entry
 * @body content (string, required if type is link) - The content of the idea box entry
 * @body imageLink (string, optional) - The link to the image, will raise an error if type is not image
 * @body folder (string, optional, must_exist) - The folder of the idea box entry
 * @body file (file, required if type is image) - The image file
 * @response 201 (IIdeaBoxEntry) - The created idea box entry
 */
router.post(
  "/",
  multer().single("image") as any,
  validateCreateIdea,
  validationMiddleware,
  ideasController.createIdea,
);

/**
 * @protected
 * @summary Update an idea box entry
 * @description Update an existing idea box entry with the given ID, setting the title, content, and type.
 * @param id (string, required, must_exist) - The ID of the idea box entry to update
 * @body title (string, required) - The title of the idea box entry
 * @body content (string, required) - The content of the idea box entry
 * @body type (string, required, one_of text|link) - The type of the idea box entry
 * @response 200 (IIdeaBoxEntry) - The updated idea box entry
 */
router.patch(
  "/:id",
  validateUpdateIdea,
  validationMiddleware,
  ideasController.updateIdea,
);

/**
 * @protected
 * @summary Delete an idea box entry
 * @description Delete an existing idea box entry with the given ID.
 * @param id (string, required, must_exist) - The ID of the idea box entry to delete
 * @response 204 - The idea box entry was successfully deleted
 */
router.delete(
  "/:id",
  validateDeleteIdea,
  validationMiddleware,
  ideasController.deleteIdea,
);

/**
 * @protected
 * @summary Pin/unpin an idea box entry
 * @description Update the pinned status of an existing idea box entry with the given ID.
 * @param id (string, required, must_exist) - The ID of the idea box entry to pin
 * @response 200 (IIdeaBoxEntry) - The updated idea box entry
 */
router.post(
  "/pin/:id",
  validatePinIdea,
  validationMiddleware,
  ideasController.pinIdea,
);

/**
 * @protected
 * @summary Archive/unarchive an idea box entry
 * @description Update the archived status of an existing idea box entry with the given ID.
 * @param id (string, required, must_exist) - The ID of the idea box entry to archive
 * @response 200 (IIdeaBoxEntry) - The updated idea box entry
 */
router.post(
  "/archive/:id",
  validateArchiveIdea,
  validationMiddleware,
  ideasController.archiveIdea,
);

/**
 * @protected
 * @summary Move an idea box entry to a folder
 * @description Update the folder of an existing idea box entry with the given ID.
 * @param id (string, required, must_exist) - The ID of the idea box entry to move
 * @query folder (string, required, must_exist) - The folder to move the idea box entry to
 * @response 200 (IIdeaBoxEntry) - The updated idea box entry
 */
router.post(
  "/move/:id",
  validateMoveIdea,
  validationMiddleware,
  ideasController.moveIdea,
);

/**
 * @protected
 * @summary Remove an idea box entry from a folder
 * @description Update the folder of an existing idea box entry with the given ID to an empty string.
 * @param id (string, required, must_exist) - The ID of the idea box entry to remove from the folder
 * @response 200 (IIdeaBoxEntry) - The updated idea box entry
 */
router.delete(
  "/move/:id",
  validateRemoveFromFolder,
  validationMiddleware,
  ideasController.removeFromFolder,
);

export default router;
