import { checkExistence } from "@utils/PBRecordValidator";
import { successWithBaseResponse } from "@utils/response";
import { Request, Response } from "express";
import { BaseResponse } from "../../../core/typescript/base_response";
import * as tagsService from "../services/tags.service";
import { IIdeaBoxTag } from "../typescript/ideabox_interfaces";

export const getTags = async (
  req: Request,
  res: Response<BaseResponse<IIdeaBoxTag[]>>,
) => {
  const { pb } = req;
  const { container } = req.params;

  if (!(await checkExistence(req, res, "idea_box_containers", container)))
    return;

  const tags = await tagsService.getTags(pb, container);
  successWithBaseResponse(res, tags);
};

export const createTag = async (
  req: Request,
  res: Response<BaseResponse<IIdeaBoxTag>>,
) => {
  const { pb } = req;
  const { container } = req.params;
  const { name, icon, color } = req.body;

  if (!(await checkExistence(req, res, "idea_box_containers", container)))
    return;

  const tag = await tagsService.createTag(pb, name, icon, color, container);
  successWithBaseResponse(res, tag, 201);
};

export const updateTag = async (
  req: Request,
  res: Response<BaseResponse<IIdeaBoxTag>>,
) => {
  const { pb } = req;
  const { id } = req.params;
  const { name, icon, color } = req.body;

  if (!(await checkExistence(req, res, "idea_box_tags", id))) {
    return;
  }

  const tag = await tagsService.updateTag(pb, id, name, icon, color);
  successWithBaseResponse(res, tag);
};

export const deleteTag = async (req: Request, res: Response<BaseResponse>) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "idea_box_tags", id))) {
    return;
  }

  await tagsService.deleteTag(pb, id);
  successWithBaseResponse(res, undefined, 204);
};
