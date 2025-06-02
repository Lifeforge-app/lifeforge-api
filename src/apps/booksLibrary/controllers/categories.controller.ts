import { z } from "zod";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import { checkExistence } from "@utils/PBRecordValidator";
import { zodHandler } from "@utils/asyncWrapper";
import { successWithBaseResponse } from "@utils/response";

import * as CategoriesService from "../services/categories.service";
import { BooksLibraryCategorySchema } from "../typescript/books_library_interfaces";

export const getAllCategories = zodHandler(
  {
    response: z.array(WithPBSchema(BooksLibraryCategorySchema)),
  },
  async (req, res) => {
    const { pb } = req;

    const categories = await CategoriesService.getAllCategories(pb);

    successWithBaseResponse(res, categories);
  },
);

export const createCategory = zodHandler(
  {
    body: BooksLibraryCategorySchema.omit({ amount: true }),
    response: WithPBSchema(BooksLibraryCategorySchema),
  },
  async (req, res) => {
    const { pb } = req;

    const category = await CategoriesService.createCategory(pb, req.body);

    successWithBaseResponse(res, category);
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
  async (req, res) => {
    const { pb } = req;
    const { id } = req.params;

    if (!(await checkExistence(req, res, "books_library_categories", id))) {
      return;
    }

    const category = await CategoriesService.updateCategory(pb, id, req.body);

    successWithBaseResponse(res, category);
  },
);

export const deleteCategory = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  },
  async (req, res) => {
    const { pb } = req;
    const { id } = req.params;

    if (!(await checkExistence(req, res, "books_library_categories", id))) {
      return;
    }

    await CategoriesService.deleteCategory(pb, id);

    successWithBaseResponse(res, undefined, 204);
  },
);
