import { checkExistence } from "@utils/PBRecordValidator";
import { clientError, successWithBaseResponse } from "@utils/response";
import { Request, Response } from "express";
import { BaseResponse } from "../../../core/typescript/base_response";
import * as CategoriesService from "../services/categories.service";
import { ICalendarCategory } from "../typescript/calendar_interfaces";

export const getAllCategories = async (
  req: Request,
  res: Response<BaseResponse<ICalendarCategory[]>>,
) => {
  const { pb } = req;

  const categories = await CategoriesService.getAllCategories(pb);
  successWithBaseResponse(res, categories);
};

export const createCategory = async (
  req: Request,
  res: Response<BaseResponse<ICalendarCategory>>,
) => {
  const { pb } = req;
  const categoryData = req.body;

  if (categoryData.name.startsWith("_")) {
    return clientError(res, "Category name cannot start with _");
  }

  const category = await CategoriesService.createCategory(pb, categoryData);
  successWithBaseResponse(res, category, 201);
};

export const updateCategory = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<ICalendarCategory>>,
) => {
  const { pb } = req;
  const { id } = req.params;
  const categoryData = req.body;

  if (categoryData.name.startsWith("_")) {
    return clientError(res, "Category name cannot start with _");
  }

  if (!(await checkExistence(req, res, "calendar_categories", id))) {
    return;
  }

  const category = await CategoriesService.updateCategory(pb, id, categoryData);
  successWithBaseResponse(res, category);
};

export const deleteCategory = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<undefined>>,
) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "calendar_categories", id))) {
    return;
  }

  await CategoriesService.deleteCategory(pb, id);
  successWithBaseResponse(res, undefined, 204);
};

export const getCategoryById = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<ICalendarCategory>>,
) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "calendar_categories", id))) {
    return;
  }

  const category = await CategoriesService.getCategoryById(pb, id);
  successWithBaseResponse(res, category);
};
