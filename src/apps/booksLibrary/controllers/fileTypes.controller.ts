import { z } from "zod/v4";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import { forgeController } from "@utils/forgeController";

import * as FileTypesService from "../services/fileTypes.service";
import { BooksLibraryFileTypeSchema } from "../typescript/books_library_interfaces";

export const getAllFileTypes = forgeController(
  {
    response: z.array(WithPBSchema(BooksLibraryFileTypeSchema)),
  },
  async ({ pb }) => await FileTypesService.getAllFileTypes(pb),
);
