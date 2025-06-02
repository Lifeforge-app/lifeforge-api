import { Request, Response } from "express";

import { BaseResponse } from "@typescript/base_response";

import { checkExistence } from "@utils/PBRecordValidator";
import { successWithBaseResponse } from "@utils/response";

import * as CategoriesService from "../services/categories.service";
import { IWalletCategory } from "../wallet_interfaces";

export const getAllCategories = async (
  req: Request,
  res: Response<BaseResponse<IWalletCategory[]>>,
) => {
  const { pb } = req;

  const categories = await CategoriesService.getAllCategories(pb);
  successWithBaseResponse(res, categories);
};

export const createCategory = async (
  req: Request,
  res: Response<BaseResponse<IWalletCategory>>,
) => {
  const { pb } = req;
  const { name, icon, color, type } = req.body;

  const category = await CategoriesService.createCategory(pb, {
    name,
    icon,
    color,
    type,
  });
  successWithBaseResponse(res, category, 201);
};

export const updateCategory = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<IWalletCategory>>,
) => {
  const { pb } = req;
  const { id } = req.params;
  const { name, icon, color, type } = req.body;

  if (!(await checkExistence(req, res, "wallet_categories", id))) {
    return;
  }

  const category = await CategoriesService.updateCategory(pb, id, {
    name,
    icon,
    color,
    type,
  });
  successWithBaseResponse(res, category);
};

export const deleteCategory = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<null>>,
) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "wallet_categories", id))) {
    return;
  }

  await CategoriesService.deleteCategory(pb, id);
  successWithBaseResponse(res, undefined, 204);
};
