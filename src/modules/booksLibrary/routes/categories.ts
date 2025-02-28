import express, { Request, Response } from "express";
import asyncWrapper from "../../../utils/asyncWrapper";
import { successWithBaseResponse } from "../../../utils/response";
import { list } from "../../../utils/CRUD";
import { BaseResponse } from "../../../interfaces/base_response";
import { body } from "express-validator";
import { IBooksLibraryCategory } from "../../../interfaces/books_library_interfaces";

const router = express.Router();

/**
 * @protected
 * @summary Get a list of all book categories
 * @description Retrieve a list of all book categories.
 * @response 200 (IBooksLibraryCategory[]) - The list of book categories
 */
router.get(
  "/",
  asyncWrapper(
    async (
      req: Request,
      res: Response<BaseResponse<IBooksLibraryCategory[]>>
    ) =>
      list(req, res, "books_library_categories", {
        sort: "name",
      })
  )
);

/**
 * @protected
 * @summary Create a new book category
 * @description Create a new pribook category with the given name and icon.
 * @body name (string, required) - The name of the category
 * @body icon (string, required) - The icon of the category, can be any icon available in Iconify
 * @response 201 (IBooksLibraryCategory) - The created book category
 */
router.post(
  "/",
  [body("name").isString(), body("icon").isString()],
  asyncWrapper(
    async (req, res: Response<BaseResponse<IBooksLibraryCategory>>) => {
      const { pb } = req;
      const { name, icon } = req.body;

      const category: IBooksLibraryCategory = await pb
        .collection("books_library_categories")
        .create({
          name,
          icon,
        });

      successWithBaseResponse(res, category);
    }
  )
);

/**
 * @protected
 * @summary Update a book category
 * @description Update a book category with the given name and icon.
 * @param id (string, required, must_exist) - The ID of the book category
 * @body name (string, required) - The name of the category
 * @body icon (string, required) - The icon of the category, can be any icon available in Iconify
 * @response 200 (IProjectsMCategory) - The updated book category
 */
router.patch(
  "/:id",
  [body("name").isString(), body("icon").isString()],
  asyncWrapper(
    async (req, res: Response<BaseResponse<IBooksLibraryCategory>>) => {
      const { pb } = req;
      const { id } = req.params;
      const { name, icon } = req.body;

      const category: IBooksLibraryCategory = await pb
        .collection("books_library_categories")
        .update(id, {
          name,
          icon,
        });

      successWithBaseResponse(res, category);
    }
  )
);

/**
 * @protected
 * @summary Delete a book category
 * @description Delete a book category with the given ID.
 * @param id (string, required, must_exist) - The ID of the book category
 * @response 204 - The book category was successfully deleted
 */
router.delete(
  "/:id",
  asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { id } = req.params;

    await pb.collection("books_library_categories").delete(id);

    successWithBaseResponse(res);
  })
);

export default router;
