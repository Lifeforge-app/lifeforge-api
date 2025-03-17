import { checkExistence } from "@utils/PBRecordValidator";
import { serverError, successWithBaseResponse } from "@utils/response";
import { Request, Response } from "express";
import { BaseResponse } from "../../../core/typescript/base_response";
import * as tagsService from "../services/tags.service";
import { ITodoListTag } from "../typescript/todo_list_interfaces";

/**
 * Get all todo tags
 */
export const getAllTags = async (
  req: Request,
  res: Response<BaseResponse<ITodoListTag[]>>,
) => {
  const { pb } = req;

  try {
    const tags = await tagsService.getAllTags(pb);
    successWithBaseResponse(res, tags);
  } catch (error) {
    serverError(res, "Failed to fetch todo tags");
  }
};

/**
 * Create a new todo tag
 */
export const createTag = async (
  req: Request,
  res: Response<BaseResponse<ITodoListTag>>,
) => {
  const { pb } = req;
  const { name } = req.body;

  try {
    const tag = await tagsService.createTag(pb, { name });
    successWithBaseResponse(res, tag, 201);
  } catch (error) {
    serverError(res, "Failed to create todo tag");
  }
};

/**
 * Update a todo tag
 */
export const updateTag = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<ITodoListTag>>,
) => {
  const { pb } = req;
  const { id } = req.params;
  const { name } = req.body;

  if (!(await checkExistence(req, res, "todo_tags", id))) {
    return;
  }

  try {
    const tag = await tagsService.updateTag(pb, id, { name });
    successWithBaseResponse(res, tag);
  } catch (error) {
    serverError(res, "Failed to update todo tag");
  }
};

/**
 * Delete a todo tag
 */
export const deleteTag = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<undefined>>,
) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "todo_tags", id))) {
    return;
  }

  try {
    await tagsService.deleteTag(pb, id);
    successWithBaseResponse(res, undefined, 204);
  } catch (error) {
    serverError(res, "Failed to delete todo tag");
  }
};
