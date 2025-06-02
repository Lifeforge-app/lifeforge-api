import { Request, Response } from "express";

import { BaseResponse } from "@typescript/base_response";

import { checkExistence } from "@utils/PBRecordValidator";
import { successWithBaseResponse } from "@utils/response";

import * as listsService from "../services/lists.service";
import { ITodoListList } from "../typescript/todo_list_interfaces";

export const getAllLists = async (
  req: Request,
  res: Response<BaseResponse<ITodoListList[]>>,
) => {
  const { pb } = req;

  const lists = await listsService.getAllLists(pb);
  successWithBaseResponse(res, lists);
};

export const createList = async (
  req: Request,
  res: Response<BaseResponse<ITodoListList>>,
) => {
  const { pb } = req;
  const { name, icon, color } = req.body;

  const list = await listsService.createList(pb, { name, icon, color });
  successWithBaseResponse(res, list, 201);
};

export const updateList = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<ITodoListList>>,
) => {
  const { pb } = req;
  const { id } = req.params;
  const { name, icon, color } = req.body;

  if (!(await checkExistence(req, res, "todo_lists", id))) {
    return;
  }

  const list = await listsService.updateList(pb, id, { name, icon, color });
  successWithBaseResponse(res, list);
};

export const deleteList = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<undefined>>,
) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "todo_lists", id))) {
    return;
  }

  await listsService.deleteList(pb, id);
  successWithBaseResponse(res, undefined, 204);
};
