import { checkExistence } from "@utils/PBRecordValidator";
import { clientError, successWithBaseResponse } from "@utils/response";
import { Request, Response } from "express";
import { BaseResponse } from "../../../core/typescript/base_response";
import * as subtasksService from "../services/subtasks.service";
import { ITodoSubtask } from "../typescript/todo_list_interfaces";

export const getSubtasks = async (
  req: Request,
  res: Response<BaseResponse<ITodoSubtask[]>>,
) => {
  const { pb } = req;
  const { id } = req.params;

  try {
    const subtasks = await subtasksService.getSubtasksForEntry(pb, id);
    successWithBaseResponse(res, subtasks);
  } catch (error) {
    clientError(res, "Error retrieving subtasks");
  }
};

export const generateSubtasks = async (
  req: Request,
  res: Response<BaseResponse<string[]>>,
) => {
  const { pb } = req;
  const { summary, notes, level } = req.body;

  try {
    const subtasks = await subtasksService.generateSubtasksWithAI(
      pb,
      summary,
      notes,
      level,
    );
    successWithBaseResponse(res, subtasks);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error generating subtasks";
    clientError(res, message);
  }
};

export const toggleSubtask = async (
  req: Request,
  res: Response<BaseResponse<ITodoSubtask>>,
) => {
  const { pb } = req;
  const { id } = req.params;

  try {
    if (!(await checkExistence(req, res, "todo_subtasks", id))) {
      return;
    }

    const subtask = await subtasksService.toggleSubtaskCompletion(pb, id);
    successWithBaseResponse(res, subtask);
  } catch (error) {
    clientError(res, "Error toggling subtask");
  }
};
