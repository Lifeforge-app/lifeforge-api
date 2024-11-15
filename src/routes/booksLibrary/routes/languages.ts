import express, { Response } from "express";
import asyncWrapper from "../../../utils/asyncWrapper.js";
import { successWithBaseResponse } from "../../../utils/response.js";
import { list } from "../../../utils/CRUD.js";
import { BaseResponse } from "../../../interfaces/base_response.js";
import { body } from "express-validator";
import hasError from "../../../utils/checkError.js";
import { IBooksLibraryLanguage } from "../../../interfaces/books_library_interfaces.js";

const router = express.Router();

/**
 * @protected
 * @summary Get a list of all book languages
 * @description Retrieve a list of all book languages.
 * @response 200 (IBooksLibraryLanguage[]) - The list of book languages
 */
router.get(
  "/",
  asyncWrapper(
    async (req, res: Response<BaseResponse<IBooksLibraryLanguage[]>>) =>
      list(req, res, "books_library_languages")
  )
);

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
  [body("name").isString(), body("icon").isString()],
  asyncWrapper(
    async (req, res: Response<BaseResponse<IBooksLibraryLanguage>>) => {
      if (hasError(req, res)) return;

      const { pb } = req;
      const { name, icon } = req.body;

      const language: IBooksLibraryLanguage = await pb
        .collection("books_library_languages")
        .create({
          name,
          icon,
        });

      successWithBaseResponse(res, language);
    }
  )
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
  [body("name").isString(), body("icon").isString()],
  asyncWrapper(
    async (req, res: Response<BaseResponse<IBooksLibraryLanguage>>) => {
      if (hasError(req, res)) return;

      const { pb } = req;
      const { id } = req.params;
      const { name, icon } = req.body;

      const language: IBooksLibraryLanguage = await pb
        .collection("books_library_languages")
        .update(id, {
          name,
          icon,
        });

      successWithBaseResponse(res, language);
    }
  )
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
  asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { id } = req.params;

    await pb.collection("books_library_languages").delete(id);

    successWithBaseResponse(res);
  })
);

export default router;
