import express, { Response } from "express";
import asyncWrapper from "../../../utils/asyncWrapper.js";
import { successWithBaseResponse } from "../../../utils/response.js";
import { list } from "../../../utils/CRUD.js";
import { BaseResponse } from "../../../interfaces/base_response.js";
import { body } from "express-validator";
import hasError from "../../../utils/checkError.js";
import { IBooksLibraryFileType } from "../../../interfaces/books_library_interfaces.js";

const router = express.Router();

/**
 * @protected
 * @summary Get a list of all book file types
 * @description Retrieve a list of all book file types.
 * @response 200 (IBooksLibraryFileType[]) - The list of book file types
 */
router.get(
  "/",
  asyncWrapper(
    async (req, res: Response<BaseResponse<IBooksLibraryFileType[]>>) =>
      list(req, res, "books_library_file_types")
  )
);

export default router;
