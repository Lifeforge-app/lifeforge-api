import { checkExistence } from "@utils/PBRecordValidator";
import { serverError, successWithBaseResponse } from "@utils/response";
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

  try {
    if (!(await checkExistence(req, res, "wishlist_lists", id))) {
      return;
    }

    const list = await listsService.getList(pb, id);
    successWithBaseResponse(res, list);
  } catch (error) {
    console.error(error);
    serverError(res, "Failed to fetch wishlist");
  }
};

export const checkListExists = async (req: any, res: Response) => {
  const { id } = req.params;
  const { pb } = req;

  try {
    const exists = await listsService.checkListExists(pb, id);
    successWithBaseResponse(res, exists);
  } catch (error) {
    console.error(error);
    serverError(res, "Failed to check if wishlist exists");
  }
};

export const getAllLists = async (
  req: any,
  res: Response<BaseResponse<IWishlistList[]>>,
) => {
  const { pb } = req;

  try {
    const lists = await listsService.getAllLists(pb);
    successWithBaseResponse(res, lists);
  } catch (error) {
    console.error(error);
    serverError(res, "Failed to fetch wishlists");
  }
};

export const createList = async (
  req: any,
  res: Response<BaseResponse<IWishlistList>>,
) => {
  const { pb } = req;
  const { name, description, color, icon } = req.body;

  try {
    const list = await listsService.createList(pb, {
      name,
      description,
      color,
      icon,
    });

    successWithBaseResponse(res, list, 201);
  } catch (error) {
    console.error(error);
    serverError(res, "Failed to create wishlist");
  }
};

export const updateList = async (
  req: any,
  res: Response<BaseResponse<IIdeaBoxContainer>>,
) => {
  const { pb } = req;
  const { id } = req.params;
  const { name, description, color, icon } = req.body;

  try {
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
  } catch (error) {
    console.error(error);
    serverError(res, "Failed to update wishlist");
  }
};

export const deleteList = async (req: any, res: Response<BaseResponse>) => {
  const { pb } = req;
  const { id } = req.params;

  try {
    if (!(await checkExistence(req, res, "wishlist_lists", id))) {
      return;
    }

    await listsService.deleteList(pb, id);
    successWithBaseResponse(res, undefined, 204);
  } catch (error) {
    console.error(error);
    serverError(res, "Failed to delete wishlist");
  }
};
