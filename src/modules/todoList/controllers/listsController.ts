import { Request, Response } from "express";
import { BaseResponse } from "../../../interfaces/base_response";
import { ITodoListList } from "../../../interfaces/todo_list_interfaces";
import { checkExistence } from "../../../utils/PBRecordValidator";
import { serverError, successWithBaseResponse } from "../../../utils/response";
import * as listsService from "../services/listsService";

/**
 * Get all todo lists
 */
export const getAllLists = async (
  req: Request,
  res: Response<BaseResponse<ITodoListList[]>>,
) => {
  const { pb } = req;

  try {
    const lists = await listsService.getAllLists(pb);
    successWithBaseResponse(res, lists);
  } catch (error) {
    serverError(res, "Failed to fetch todo lists");
  }
};

/**
 * Create a new todo list
 */
export const createList = async (
  req: Request,
  res: Response<BaseResponse<ITodoListList>>,
) => {
  const { pb } = req;
  const { name, icon, color } = req.body;

  try {
    const list = await listsService.createList(pb, { name, icon, color });
    successWithBaseResponse(res, list, 201);
  } catch (error) {
    serverError(res, "Failed to create todo list");
  }
};

/**
 * Update a todo list
 */
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

  try {
    const list = await listsService.updateList(pb, id, { name, icon, color });
    successWithBaseResponse(res, list);
  } catch (error) {
    serverError(res, "Failed to update todo list");
  }
};

/**
 * Delete a todo list
 */
export const deleteList = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<undefined>>,
) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "todo_lists", id))) {
    return;
  }

  try {
    await listsService.deleteList(pb, id);
    successWithBaseResponse(res, undefined, 204);
  } catch (error) {
    serverError(res, "Failed to delete todo list");
  }
};
