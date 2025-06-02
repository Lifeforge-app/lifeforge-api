import { BaseResponse } from "@typescript/base_response";
import { checkExistence } from "@utils/PBRecordValidator";
import { successWithBaseResponse } from "@utils/response";
import { Request, Response } from "express";
import * as CategoriesService from "../services/categories.service";
import { IBooksLibraryCategory } from "../typescript/books_library_interfaces";

export const getAllCategories = async (
  req: Request,
  res: Response<BaseResponse<IBooksLibraryCategory[]>>,
) => {
  const { pb } = req;
  const categories = await CategoriesService.getAllCategories(pb);
  successWithBaseResponse(res, categories);
};

export const createCategory = async (
  req: Request,
  res: Response<BaseResponse<IBooksLibraryCategory>>,
) => {
  const { pb } = req;
  const data = req.body;
  const category = await CategoriesService.createCategory(pb, data);
  successWithBaseResponse(res, category);
};

export const updateCategory = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<IBooksLibraryCategory>>,
) => {
  const { pb } = req;
  const { id } = req.params;
  const data = req.body as Partial<IBooksLibraryCategory>;

  if (!(await checkExistence(req, res, "books_library_categories", id))) {
    return;
  }

  const category = await CategoriesService.updateCategory(pb, id, data);
  successWithBaseResponse(res, category);
};

export const deleteCategory = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<undefined>>,
) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "books_library_categories", id))) {
    return;
  }

  await CategoriesService.deleteCategory(pb, id);
  successWithBaseResponse(res, undefined, 204);
};
