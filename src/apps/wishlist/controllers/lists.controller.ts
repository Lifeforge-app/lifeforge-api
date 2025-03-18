import { checkExistence } from "@utils/PBRecordValidator";
import { successWithBaseResponse } from "@utils/response";
import { Response } from "express";
import { BaseResponse } from "../../../core/typescript/base_response";
import { IIdeaBoxContainer } from "../../ideaBox/typescript/ideabox_interfaces";
import * as listsService from "../services/lists.service";
import { IWishlistList } from "../typescript/wishlist_interfaces";

export const getList = async (
  req: any,
  res: Response<BaseResponse<IWishlistList>>,
) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "wishlist_lists", id))) {
    return;
  }

  const list = await listsService.getList(pb, id);
  successWithBaseResponse(res, list);
};

export const checkListExists = async (req: any, res: Response) => {
  const { id } = req.params;
  const { pb } = req;

  const exists = await listsService.checkListExists(pb, id);
  successWithBaseResponse(res, exists);
};

export const getAllLists = async (
  req: any,
  res: Response<BaseResponse<IWishlistList[]>>,
) => {
  const { pb } = req;

  const lists = await listsService.getAllLists(pb);
  successWithBaseResponse(res, lists);
};

export const createList = async (
  req: any,
  res: Response<BaseResponse<IWishlistList>>,
) => {
  const { pb } = req;
  const { name, description, color, icon } = req.body;

  const list = await listsService.createList(pb, {
    name,
    description,
    color,
    icon,
  });

  successWithBaseResponse(res, list, 201);
};

export const updateList = async (
  req: any,
  res: Response<BaseResponse<IIdeaBoxContainer>>,
) => {
  const { pb } = req;
  const { id } = req.params;
  const { name, description, color, icon } = req.body;

  if (!(await checkExistence(req, res, "wishlist_lists", id))) {
    return;
  }

  const list = await listsService.updateList(pb, id, {
    name,
    description,
    color,
    icon,
  });

  successWithBaseResponse(res, list);
};

export const deleteList = async (req: any, res: Response<BaseResponse>) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "wishlist_lists", id))) {
    return;
  }

  await listsService.deleteList(pb, id);
  successWithBaseResponse(res, undefined, 204);
};
