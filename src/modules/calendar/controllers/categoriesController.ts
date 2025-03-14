import { Request, Response } from "express";
import * as CategoriesService from "../services/categoriesService";
import { serverError, successWithBaseResponse } from "../../../utils/response";
import { ICalendarCategory } from "../../../interfaces/calendar_interfaces";
import { BaseResponse } from "../../../interfaces/base_response";
import { checkExistence } from "../../../utils/PBRecordValidator";

export const getAllCategories = async (
  req: Request,
  res: Response<BaseResponse<ICalendarCategory[]>>
) => {
  const { pb } = req;

  try {
    const categories = await CategoriesService.getAllCategories(pb);
    successWithBaseResponse(res, categories);
  } catch (error) {
    serverError(res, "Failed to fetch calendar categories");
  }
};

export const createCategory = async (
  req: Request,
  res: Response<BaseResponse<ICalendarCategory>>
) => {
  const { pb } = req;
  const categoryData = req.body;

  try {
    const category = await CategoriesService.createCategory(pb, categoryData);
    successWithBaseResponse(res, category, 201);
  } catch (error) {
    serverError(res, "Failed to create calendar category");
  }
};

export const updateCategory = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<ICalendarCategory>>
) => {
  const { pb } = req;
  const { id } = req.params;
  const categoryData = req.body;

  if (!(await checkExistence(req, res, "calendar_categories", id))) return;

  try {
    const category = await CategoriesService.updateCategory(
      pb,
      id,
      categoryData
    );
    successWithBaseResponse(res, category);
  } catch (error) {
    serverError(res, "Failed to update calendar category");
  }
};

export const deleteCategory = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<undefined>>
) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "calendar_categories", id))) return;

  try {
    const isDeleted = await CategoriesService.deleteCategory(pb, id);

    if (isDeleted) {
      successWithBaseResponse(res, undefined, 204);
    } else {
      serverError(res, "Failed to delete calendar category");
    }
  } catch (error) {
    serverError(res, "Failed to delete calendar category");
  }
};

export const getCategoryById = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<ICalendarCategory>>
) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "calendar_categories", id))) return;

  try {
    const category = await CategoriesService.getCategoryById(pb, id);
    successWithBaseResponse(res, category);
  } catch (error) {
    serverError(res, "Failed to fetch calendar category");
  }
};
