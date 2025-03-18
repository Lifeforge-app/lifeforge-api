import { checkExistence } from "@utils/PBRecordValidator";
import { successWithBaseResponse } from "@utils/response";
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

  const subtasks = await subtasksService.getSubtasksForEntry(pb, id);
  successWithBaseResponse(res, subtasks);
};

export const generateSubtasks = async (
  req: Request,
  res: Response<BaseResponse<string[]>>,
) => {
  const { pb } = req;
  const { summary, notes, level } = req.body;

  const subtasks = await subtasksService.generateSubtasksWithAI(
    pb,
    summary,
    notes,
    level,
  );
  successWithBaseResponse(res, subtasks);
};

export const toggleSubtask = async (
  req: Request,
  res: Response<BaseResponse<ITodoSubtask>>,
) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "todo_subtasks", id))) {
    return;
  }

  const subtask = await subtasksService.toggleSubtaskCompletion(pb, id);
  successWithBaseResponse(res, subtask);
};
