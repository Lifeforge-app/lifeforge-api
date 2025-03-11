import { Request, Response } from "express";
import { serverError, successWithBaseResponse } from "../../../utils/response";
import { BaseResponse } from "../../../interfaces/base_response";
import { checkExistence } from "../../../utils/PBRecordValidator";
import { IWalletCategory } from "../../../interfaces/wallet_interfaces";
import * as CategoriesService from "../services/categoriesService";

export const getAllCategories = async (
  req: Request,
  res: Response<BaseResponse<IWalletCategory[]>>
) => {
  const { pb } = req;

  const categories = await CategoriesService.getAllCategories(pb);

  if (!categories) {
    serverError(res, "Failed to fetch categories");
    return;
  }

  successWithBaseResponse(res, categories);
};

export const createCategory = async (
  req: Request,
  res: Response<BaseResponse<IWalletCategory>>
) => {
  const { pb } = req;
  const { name, icon, color, type } = req.body;

  const category = await CategoriesService.createCategory(pb, {
    name,
    icon,
    color,
    type,
  });

  if (!category) {
    serverError(res, "Failed to create category");
    return;
  }

  successWithBaseResponse(res, category, 201);
};

export const updateCategory = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<IWalletCategory>>
) => {
  const { pb } = req;
  const { id } = req.params;
  const { name, icon, color, type } = req.body;

  if (!(await checkExistence(req, res, "wallet_categories", id))) return;

  const category = await CategoriesService.updateCategory(pb, id, {
    name,
    icon,
    color,
    type,
  });

  if (!category) {
    serverError(res, "Failed to update category");
    return;
  }

  successWithBaseResponse(res, category);
};

export const deleteCategory = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<null>>
) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "wallet_categories", id))) return;

  const isDeleted = await CategoriesService.deleteCategory(pb, id);

  if (!isDeleted) {
    serverError(res, "Failed to delete category");
    return;
  }

  successWithBaseResponse(res, null);
};
