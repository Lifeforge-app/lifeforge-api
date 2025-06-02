import { z } from "zod";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import { zodHandler } from "@utils/asyncWrapper";
import { successWithBaseResponse } from "@utils/response";

import * as FileTypesService from "../services/fileTypes.service";
import { BooksLibraryFileTypeSchema } from "../typescript/books_library_interfaces";

export const getAllFileTypes = zodHandler(
  {
    response: z.array(WithPBSchema(BooksLibraryFileTypeSchema)),
  },
  async (req, res) => {
    const { pb } = req;

    const fileTypes = await FileTypesService.getAllFileTypes(pb);

    successWithBaseResponse(res, fileTypes);
  },
);
