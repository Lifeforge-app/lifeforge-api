import express, { Response } from "express";
import asyncWrapper from "../../../utils/asyncWrapper.js";
import { list } from "../../../utils/CRUD.js";
import {
  IBooksLibraryEntry,
  IBooksLibraryFileType,
} from "../../../interfaces/books_library_interfaces.js";
import { BaseResponse } from "../../../interfaces/base_response.js";
import {
  checkExistence,
  validateExistence,
} from "../../../utils/PBRecordValidator.js";
import { successWithBaseResponse } from "../../../utils/response.js";
import { body } from "express-validator";
import hasError from "../../../utils/checkError.js";

const router = express.Router();

/**
 * @protected
 * @summary Get a list of all book library entries
 * @description Retrieve a list of all book library entries.
 * @response 200 (IBooksLibraryEntry[]) - The list of book library entries
 */
router.get(
  "/",
  asyncWrapper(async (req, res: Response<BaseResponse<IBooksLibraryEntry[]>>) =>
    list<IBooksLibraryEntry>(req, res, "books_library_entries", {
      sort: "-is_favourite,-created",
    })
  )
);

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
 * @body title (string, required) - The title of the book
 * @body year_published (string, required) - The year the book was published
 * @response 200 (IBooksLibraryEntry) - The updated book library entry
 */
router.patch(
  "/:id",
  [
    body("authors").isString(),
    body("category").custom(
      async (value: string, meta) =>
        await validateExistence(
          meta.req.pb,
          "books_library_categories",
          value,
          true
        )
    ),
    body("edition").isString(),
    body("isbn").isString(),
    body("languages")
      .isArray()
      .custom(
        async (value: string[], meta) =>
          await Promise.all(
            value.map((v) =>
              validateExistence(meta.req.pb, "books_library_languages", v, true)
            )
          )
      ),
    body("publisher").isString(),
    body("title").isString(),
    body("year_published").isNumeric(),
  ],
  asyncWrapper(async (req, res: Response<BaseResponse<IBooksLibraryEntry>>) => {
    if (hasError(req, res)) return;

    const { pb } = req;
    const { id } = req.params;
    const data = req.body;

    if (!(await checkExistence(req, res, "books_library_entries", id, "id")))
      return;

    const entry: IBooksLibraryEntry = await pb
      .collection("books_library_entries")
      .update(id, data);

    successWithBaseResponse(res, entry);
  })
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
  asyncWrapper(async (req, res: Response<BaseResponse<IBooksLibraryEntry>>) => {
    const { pb } = req;
    const { id } = req.params;

    if (!(await checkExistence(req, res, "books_library_entries", id, "id")))
      return;

    const book: IBooksLibraryEntry = await pb
      .collection("books_library_entries")
      .getOne(id);
    const entry: IBooksLibraryEntry = await pb
      .collection("books_library_entries")
      .update(id, {
        ...book,
        is_favourite: !book.is_favourite,
      });

    successWithBaseResponse(res, entry);
  })
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
  asyncWrapper(async (req, res: Response<BaseResponse>) => {
    const { pb } = req;
    const { id } = req.params;

    if (!(await checkExistence(req, res, "books_library_entries", id, "id")))
      return;

    const entry = await pb
      .collection("books_library_entries")
      .getOne<IBooksLibraryEntry>(id);

    const fileTypeEntry = await pb
      .collection("books_library_file_types")
      .getFirstListItem<IBooksLibraryFileType>(`name = "${entry.extension}"`)
      .catch(() => null);

    if (fileTypeEntry) {
      if (fileTypeEntry.count - 1 > 0) {
        await pb
          .collection("books_library_file_types")
          .update(fileTypeEntry.id, {
            count: fileTypeEntry.count - 1,
          });
      } else {
        await pb
          .collection("books_library_file_types")
          .delete(fileTypeEntry.id);
      }
    }

    await pb.collection("books_library_entries").delete(id);

    successWithBaseResponse(res, undefined, 204);
  })
);

export default router;
