import express from "express";
import validationMiddleware from "../../../middleware/validationMiddleware";
import asyncWrapper from "../../../utils/asyncWrapper";
import * as foldersController from "../controllers/foldersController";
import {
  validateCreateFolder,
  validateDeleteFolder,
  validateGetFolders,
  validateMoveFolder,
  validateRemoveFromFolder,
  validateUpdateFolder,
} from "../middleware/foldersValidation";

const router = express.Router();

/**
 * @protected
 * @summary Get a list of all idea box folders
 * @description Retrieve a list of all idea box folders, filtered by the container ID given in the query.
 * @query container (string, required) - The ID of the container
 * @response 200 (IIdeaBoxFolder[]) - The list of idea box folders
 */
router.get(
  "/:container/*",
  validateGetFolders,
  validationMiddleware,
  asyncWrapper(foldersController.getFolders),
);

/**
 * @protected
 * @summary Create a new idea box folder
 * @description Create a new idea box folder with the given name, container, icon, and color.
 * @body name (string, required) - The name of the folder
 * @body container (string, required) - The ID of the container
 * @body icon (string, required) - The icon of the folder, can be any icon available in Iconify
 * @body color (string, required) - The color of the folder, in hex format
 * @response 201 (IIdeaBoxFolder) - The created idea box folder
 */
router.post(
  "/",
  validateCreateFolder,
  validationMiddleware,
  asyncWrapper(foldersController.createFolder),
);

/**
 * @protected
 * @summary Update an idea box folder
 * @description Update an existing idea box folder with the given ID, setting the name, icon, and color.
 * @param id (string, required, must_exist) - The ID of the idea box folder to update
 * @body name (string, required) - The name of the folder
 * @body icon (string, required) - The icon of the folder, can be any icon available in Iconify
 * @body color (string, required) - The color of the folder, in hex format
 * @response 200 (IIdeaBoxFolder) - The updated idea box folder
 */
router.patch(
  "/:id",
  validateUpdateFolder,
  validationMiddleware,
  asyncWrapper(foldersController.updateFolder),
);

router.post(
  "/move/:id",
  validateMoveFolder,
  validationMiddleware,
  asyncWrapper(foldersController.moveFolder),
);

router.delete(
  "/move/:id",
  validateRemoveFromFolder,
  validationMiddleware,
  asyncWrapper(foldersController.removeFromFolder),
);

/**
 * @protected
 * @summary Delete an idea box folder
 * @description Delete an existing idea box folder with the given ID.
 * @param id (string, required, must_exist) - The ID of the idea box folder to delete
 * @response 204
 */
router.delete(
  "/:id",
  validateDeleteFolder,
  validationMiddleware,
  asyncWrapper(foldersController.deleteFolder),
);

export default router;
