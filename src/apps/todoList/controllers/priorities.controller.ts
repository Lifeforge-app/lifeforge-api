import { Request, Response } from "express";

import { BaseResponse } from "@typescript/base_response";

import { checkExistence } from "@utils/PBRecordValidator";
import { successWithBaseResponse } from "@utils/response";

import * as prioritiesService from "../services/priorities.service";
import { ITodoPriority } from "../typescript/todo_list_interfaces";

export const getAllPriorities = async (
  req: Request,
  res: Response<BaseResponse<ITodoPriority[]>>,
) => {
  const { pb } = req;

  const priorities = await prioritiesService.getAllPriorities(pb);
  successWithBaseResponse(res, priorities);
};

export const createPriority = async (
  req: Request,
  res: Response<BaseResponse<ITodoPriority>>,
) => {
  const { pb } = req;
  const { name, color } = req.body;

  const priority = await prioritiesService.createPriority(pb, {
    name,
    color,
  });
  successWithBaseResponse(res, priority, 201);
};

export const updatePriority = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<ITodoPriority>>,
) => {
  const { pb } = req;
  const { id } = req.params;
  const { name, color } = req.body;

  if (!(await checkExistence(req, res, "todo_priorities", id))) {
    return;
  }

  const priority = await prioritiesService.updatePriority(pb, id, {
    name,
    color,
  });
  successWithBaseResponse(res, priority);
};

export const deletePriority = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<undefined>>,
) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "todo_priorities", id))) {
    return;
  }

  await prioritiesService.deletePriority(pb, id);
  successWithBaseResponse(res, undefined, 204);
};
