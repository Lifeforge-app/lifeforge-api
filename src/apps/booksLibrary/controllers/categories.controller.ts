import {
  bulkRegisterControllers,
  forgeController,
} from "@functions/newForgeController";
import express from "express";
import { z } from "zod/v4";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import * as CategoriesService from "../services/categories.service";
import { BooksLibraryCategorySchema } from "../typescript/books_library_interfaces";

const booksLibraryCategoriesRouter = express.Router();

const getAllCategories = forgeController
  .route("GET /")
  .description("Get all categories for the books library")
  .schema({
    response: z.array(WithPBSchema(BooksLibraryCategorySchema)),
  })
  .callback(({ pb }) => CategoriesService.getAllCategories(pb));

const createCategory = forgeController
  .route("POST /")
  .description("Create a new category for the books library")
  .schema({
    body: BooksLibraryCategorySchema.omit({ amount: true }),
    response: WithPBSchema(BooksLibraryCategorySchema),
  })
  .statusCode(201)
  .callback(({ pb, body }) => CategoriesService.createCategory(pb, body));

const updateCategory = forgeController
  .route("PATCH /:id")
  .description("Update an existing category for the books library")
  .schema({
    params: z.object({
      id: z.string(),
    }),
    body: BooksLibraryCategorySchema.omit({ amount: true }),
    response: WithPBSchema(BooksLibraryCategorySchema),
  })
  .existenceCheck("params", {
    id: "books_library_categories",
  })
  .callback(({ pb, params: { id }, body }) =>
    CategoriesService.updateCategory(pb, id, body),
  );

const deleteCategory = forgeController
  .route("DELETE /:id")
  .description("Delete an existing category for the books library")
  .schema({
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  })
  .existenceCheck("params", {
    id: "books_library_categories",
  })
  .statusCode(204)
  .callback(({ pb, params: { id } }) =>
    CategoriesService.deleteCategory(pb, id),
  );

bulkRegisterControllers(booksLibraryCategoriesRouter, [
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
]);

export default booksLibraryCategoriesRouter;
