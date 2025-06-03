import { z } from "zod";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import { zodHandler } from "@utils/asyncWrapper";

import * as CategoriesService from "../services/categories.service";
import { BooksLibraryCategorySchema } from "../typescript/books_library_interfaces";

export const getAllCategories = zodHandler(
  {
    response: z.array(WithPBSchema(BooksLibraryCategorySchema)),
  },
  ({ pb }) => CategoriesService.getAllCategories(pb),
);

export const createCategory = zodHandler(
  {
    body: BooksLibraryCategorySchema.omit({ amount: true }),
    response: WithPBSchema(BooksLibraryCategorySchema),
  },
  ({ pb, body }) => CategoriesService.createCategory(pb, body),
  {
    statusCode: 201,
  },
);

export const updateCategory = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    body: BooksLibraryCategorySchema.omit({ amount: true }),
    response: WithPBSchema(BooksLibraryCategorySchema),
  },
  ({ pb, params, body }) =>
    CategoriesService.updateCategory(pb, params.id, body),
  {
    existenceCheck: {
      params: {
        id: "books_library_categories",
      },
    },
  },
);

export const deleteCategory = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  },
  ({ pb, params }) => CategoriesService.deleteCategory(pb, params.id),
  {
    existenceCheck: {
      params: {
        id: "books_library_categories",
      },
    },
    statusCode: 204,
  },
);
