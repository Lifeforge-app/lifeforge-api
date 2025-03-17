import { checkExistence } from "@utils/PBRecordValidator";
import { serverError, successWithBaseResponse } from "@utils/response";
import { Request, Response } from "express";
import { BaseResponse } from "../../../core/typescript/base_response";
import * as prioritiesService from "../services/priorities.service";
import { ITodoPriority } from "../typescript/todo_list_interfaces";

/**
 * Get all todo priorities
 */
export const getAllPriorities = async (
  req: Request,
  res: Response<BaseResponse<ITodoPriority[]>>,
) => {
  const { pb } = req;

  try {
    const priorities = await prioritiesService.getAllPriorities(pb);
    successWithBaseResponse(res, priorities);
  } catch (error) {
    serverError(res, "Failed to fetch todo priorities");
  }
};

/**
 * Create a new todo priority
 */
export const createPriority = async (
  req: Request,
  res: Response<BaseResponse<ITodoPriority>>,
) => {
  const { pb } = req;
  const { name, color } = req.body;

  try {
    const priority = await prioritiesService.createPriority(pb, {
      name,
      color,
    });
    successWithBaseResponse(res, priority, 201);
  } catch (error) {
    serverError(res, "Failed to create todo priority");
  }
};

/**
 * Update a todo priority
 */
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

  try {
    const priority = await prioritiesService.updatePriority(pb, id, {
      name,
      color,
    });
    successWithBaseResponse(res, priority);
  } catch (error) {
    serverError(res, "Failed to update todo priority");
  }
};

/**
 * Delete a todo priority
 */
export const deletePriority = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<undefined>>,
) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "todo_priorities", id))) {
    return;
  }

  try {
    await prioritiesService.deletePriority(pb, id);
    successWithBaseResponse(res, undefined, 204);
  } catch (error) {
    serverError(res, "Failed to delete todo priority");
  }
};
