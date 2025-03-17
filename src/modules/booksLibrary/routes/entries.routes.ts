import express from "express";
import validationMiddleware from "../../../core/middleware/validationMiddleware";
import * as EntriesController from "../controllers/entries.controller";
import { validateBodyData, validateId } from "../middlewares/entriesValidation";

const router = express.Router();

/**
 * @protected
 * @summary Get a list of all book library entries
 * @description Retrieve a list of all book library entries.
 * @response 200 (IBooksLibraryEntry[]) - The list of book library entries
 */
router.get("/", EntriesController.getAllEntries);

/**
 * @protected
 * @summary Update a book library entry
 * @description Update an existing book library entry with the given data.
 * @param id (string, required, must_exist) - The ID of the book library entry
 * @body authors (string, required) - The authors of the book
 * @body category (string, required, must_exist) - The category of the book
 * @body edition (string, required) - The edition of the book
 * @body isbn (string, required) - The ISBN of the book
 * @body languages (string[], required, must_exist) - The languages of the book
 * @body publisher (string, required) - The publisher of the book
 * @body title (string, required) - The title of th`e book
 * @body year_published (string, required) - The year the book was published
 * @response 200 (IBooksLibraryEntry) - The updated book library entry
 */
router.patch(
  "/:id",
  validateId,
  validateBodyData,
  validationMiddleware,
  EntriesController.updateEntry,
);

/**
 * @protected
 * @summary Toggle the favourite status of a book library entry
 * @description Toggle the favourite status of a book library entry.
 * @param id (string, required, must_exist) - The ID of the book library entry
 * @response 200 (IBooksLibraryEntry) - The updated book library entry
 */
router.post(
  "/favourite/:id",
  validateId,
  validationMiddleware,
  EntriesController.toggleFavouriteStatus,
);

/**
 * @protected
 * @summary Delete a book library entry
 * @description Delete a book library entry with the given ID.
 * @param id (string, required, must_exist) - The ID of the book library entry
 * @response 204 - The book library entry was deleted successfully
 */
router.delete(
  "/:id",
  validateId,
  validationMiddleware,
  EntriesController.deleteEntry,
);

export default router;
