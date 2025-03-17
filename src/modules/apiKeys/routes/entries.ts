import express from "express";
import validationMiddleware from "../../../middleware/validationMiddleware";
import * as entriesController from "../controllers/entriesController";
import {
  checkKeysValidation,
  createEntryValidation,
  deleteEntryValidation,
  getEntriesValidation,
  getEntryByIdValidation,
  updateEntryValidation,
} from "../middlewares/entriesValidation";

const router = express.Router();

/**
 * @protected
 * @summary Get a list of all API key entries
 * @description Retrieve a list of all API key entries.
 * @query master (string, required) - The master password for decryption
 * @response 200 (IAPIKeyEntry[]) - The list of API key entries
 */
router.get(
  "/",
  getEntriesValidation,
  validationMiddleware,
  entriesController.getAllEntries,
);

/**
 * @protected
 * @summary Check if all keys exist
 * @description Check if all keys in the comma-separated list exist.
 * @query keys (string, required) - Comma-separated list of key IDs
 * @response 200 (boolean) - Whether all keys exist
 */
router.get(
  "/check",
  checkKeysValidation,
  validationMiddleware,
  entriesController.checkKeys,
);

/**
 * @protected
 * @summary Get an API key entry by ID
 * @description Retrieve an API key entry by ID.
 * @param id (string, required) - The ID of the API key entry
 * @query master (string, required) - The master password for decryption
 * @response 200 (string) - The encrypted API key
 */
router.get(
  "/:id",
  getEntryByIdValidation,
  validationMiddleware,
  entriesController.getEntryById,
);

/**
 * @protected
 * @summary Create a new API key entry
 * @description Create a new API key entry with the given data.
 * @body data (string, required) - The encrypted data containing the API key entry
 * @response 201 (IAPIKeyEntry) - The created API key entry
 */
router.post(
  "/",
  createEntryValidation,
  validationMiddleware,
  entriesController.createEntry,
);

/**
 * @protected
 * @summary Update an API key entry
 * @description Update an API key entry with the given data.
 * @param id (string, required) - The ID of the API key entry
 * @body data (string, required) - The encrypted data containing the API key entry
 * @response 200 (IAPIKeyEntry) - The updated API key entry
 */
router.patch(
  "/:id",
  updateEntryValidation,
  validationMiddleware,
  entriesController.updateEntry,
);

/**
 * @protected
 * @summary Delete an API key entry
 * @description Delete an API key entry with the given ID.
 * @param id (string, required) - The ID of the API key entry
 * @response 204 - The API key entry was deleted successfully
 */
router.delete(
  "/:id",
  deleteEntryValidation,
  validationMiddleware,
  entriesController.deleteEntry,
);

export default router;
