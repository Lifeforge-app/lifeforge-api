import {
  bulkRegisterControllers,
  forgeController,
} from "@functions/newForgeController";
import express from "express";
import { z } from "zod/v4";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import * as FileTypesService from "../services/fileTypes.service";
import { BooksLibraryFileTypeSchema } from "../typescript/books_library_interfaces";

const booksLibraryFileTypesRouter = express.Router();

const getAllFileTypes = forgeController
  .route("GET /")
  .description("Get all file types for the books library")
  .schema({
    response: z.array(WithPBSchema(BooksLibraryFileTypeSchema)),
  })
  .callback(async ({ pb }) => await FileTypesService.getAllFileTypes(pb));

bulkRegisterControllers(booksLibraryFileTypesRouter, [getAllFileTypes]);

export default booksLibraryFileTypesRouter;
