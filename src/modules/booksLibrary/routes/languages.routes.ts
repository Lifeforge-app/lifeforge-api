import express from "express";
import validationMiddleware from "../../../core/middleware/validationMiddleware";
import * as LanguagesController from "../controllers/languages.controller";
import {
  validateBodyData,
  validateId,
} from "../middlewares/languagesValidation";

const router = express.Router();

/**
 * @protected
 * @summary Get a list of all book languages
 * @description Retrieve a list of all book languages.
 * @response 200 (IBooksLibraryLanguage[]) - The list of book languages
 */
router.get("/", LanguagesController.getAllLanguages);

/**
 * @protected
 * @summary Create a new book language
 * @description Create a new pribook language with the given name and icon.
 * @body name (string, required) - The name of the language
 * @body icon (string, required) - The icon of the language, can be any icon available in Iconify
 * @response 201 (IBooksLibraryLanguage) - The created book language
 */
router.post(
  "/",
  validateBodyData,
  validationMiddleware,
  LanguagesController.createLanguage,
);

/**
 * @protected
 * @summary Update a book language
 * @description Update a book language with the given name and icon.
 * @param id (string, required, must_exist) - The ID of the book language
 * @body name (string, required) - The name of the language
 * @body icon (string, required) - The icon of the language, can be any icon available in Iconify
 * @response 200 (IProjectsMLanguage) - The updated book language
 */
router.patch(
  "/:id",
  validateId,
  validateBodyData,
  validationMiddleware,
  LanguagesController.updateLanguage,
);

/**
 * @protected
 * @summary Delete a book language
 * @description Delete a book language with the given ID.
 * @param id (string, required, must_exist) - The ID of the book language
 * @response 204 - The book language was successfully deleted
 */
router.delete(
  "/:id",
  validateId,
  validationMiddleware,
  LanguagesController.deleteLanguage,
);

export default router;
