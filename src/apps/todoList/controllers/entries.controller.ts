import { checkExistence } from "@utils/PBRecordValidator";
import { successWithBaseResponse } from "@utils/response";
import { Request, Response } from "express";
import { BaseResponse } from "../../../core/typescript/base_response";
import * as entriesService from "../services/entries.service";
import {
  ITodoListEntry,
  ITodoListStatusCounter,
  ITodoSubtask,
} from "../typescript/todo_list_interfaces";

export const getEntryById = async (
  req: Request<{ id: string }>,
  res: Response<
    BaseResponse<
      Omit<ITodoListEntry, "subtasks"> & { subtasks: ITodoSubtask[] }
    >
  >,
) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "todo_entries", id))) {
    return;
  }
  const entry = await entriesService.getEntryById(pb, id);

  successWithBaseResponse(res, entry);
};

export const getAllEntries = async (
  req: Request,
  res: Response<BaseResponse<ITodoListEntry[]>>,
) => {
  const { pb } = req;
  const status = (req.query.status as string) || "all";
  const { tag, list, priority } = req.query as Record<string, string>;

  if (tag && !(await checkExistence(req, res, "todo_tags", tag))) {
    return;
  }

  if (list && !(await checkExistence(req, res, "todo_lists", list))) {
    return;
  }

  if (
    priority &&
    !(await checkExistence(req, res, "todo_priorities", priority))
  ) {
    return;
  }

  const entries = await entriesService.getAllEntries(
    pb,
    status,
    tag,
    list,
    priority,
  );
  successWithBaseResponse(res, entries);
};

export const getStatusCounter = async (
  req: Request,
  res: Response<BaseResponse<ITodoListStatusCounter>>,
) => {
  const { pb } = req;

  const counters = await entriesService.getStatusCounter(pb);
  successWithBaseResponse(res, counters);
};

export const createEntry = async (
  req: Request,
  res: Response<BaseResponse<ITodoListEntry>>,
) => {
  const { pb } = req;
  const data = req.body;

  if (data.list && !(await checkExistence(req, res, "todo_lists", data.list))) {
    return;
  }

  if (
    data.priority &&
    !(await checkExistence(req, res, "todo_priorities", data.priority))
  ) {
    return;
  }

  for (const tag of data.tags || []) {
    if (!(await checkExistence(req, res, "todo_tags", tag))) {
      return;
    }
  }

  const entry = await entriesService.createEntry(pb, data);
  successWithBaseResponse(res, entry, 201);
};

export const updateEntry = async (
  req: Request<{ id: string }>,
  res: Response<
    BaseResponse<Omit<ITodoListEntry, "subtasks"> & { subtasks: string[] }>
  >,
) => {
  const { pb } = req;
  const { id } = req.params;
  const data = req.body;

  if (!(await checkExistence(req, res, "todo_entries", id))) {
    return;
  }

  if (data.list && !(await checkExistence(req, res, "todo_lists", data.list))) {
    return;
  }

  if (
    data.priority &&
    !(await checkExistence(req, res, "todo_priorities", data.priority))
  ) {
    return;
  }

  for (const tag of data.tags || []) {
    if (!(await checkExistence(req, res, "todo_tags", tag))) {
      return;
    }
  }

  const entry = await entriesService.updateEntry(pb, id, req.body);
  successWithBaseResponse(res, entry);
};

export const deleteEntry = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<undefined>>,
) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "todo_entries", id))) {
    return;
  }

  await entriesService.deleteEntry(pb, id);
  successWithBaseResponse(res, undefined, 204);
};

export const toggleEntry = async (
  req: Request<{ id: string }>,
  res: Response<
    BaseResponse<Omit<ITodoListEntry, "subtasks"> & { subtasks: string[] }>
  >,
) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "todo_entries", id))) {
    return;
  }

  const entry = await entriesService.toggleEntry(pb, id);
  successWithBaseResponse(res, entry);
};
