import { BaseResponse } from "@typescript/base_response";
import { checkExistence } from "@utils/PBRecordValidator";
import { successWithBaseResponse } from "@utils/response";
import { Request, Response } from "express";
import * as tagsService from "../services/tags.service";
import { ITodoListTag } from "../typescript/todo_list_interfaces";

export const getAllTags = async (
  req: Request,
  res: Response<BaseResponse<ITodoListTag[]>>,
) => {
  const { pb } = req;

  const tags = await tagsService.getAllTags(pb);
  successWithBaseResponse(res, tags);
};

export const createTag = async (
  req: Request,
  res: Response<BaseResponse<ITodoListTag>>,
) => {
  const { pb } = req;
  const { name } = req.body;

  const tag = await tagsService.createTag(pb, { name });
  successWithBaseResponse(res, tag, 201);
};

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

  const tag = await tagsService.updateTag(pb, id, { name });
  successWithBaseResponse(res, tag);
};

export const deleteTag = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<undefined>>,
) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "todo_tags", id))) {
    return;
  }

  await tagsService.deleteTag(pb, id);
  successWithBaseResponse(res, undefined, 204);
};
