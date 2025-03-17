import { Request, Response } from "express";
import { BaseResponse } from "../../../interfaces/base_response";
import {
  ITodoListEntry,
  ITodoListStatusCounter,
} from "../../../interfaces/todo_list_interfaces";
import { checkExistence } from "../../../utils/PBRecordValidator";
import { serverError, successWithBaseResponse } from "../../../utils/response";
import * as entriesService from "../services/entriesService";

/**
 * Get all todo entries
 */
export const getAllEntries = async (
  req: Request,
  res: Response<BaseResponse<ITodoListEntry[]>>,
) => {
  const { pb } = req;
  const status = (req.query.status as string) || "all";
  const { tag, list, priority } = req.query as Record<string, string>;

  try {
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
  } catch (error) {
    serverError(res, "Failed to fetch todo entries");
  }
};

/**
 * Get status counter for todo entries
 */
export const getStatusCounter = async (
  req: Request,
  res: Response<BaseResponse<ITodoListStatusCounter>>,
) => {
  const { pb } = req;

  try {
    const counters = await entriesService.getStatusCounter(pb);
    successWithBaseResponse(res, counters);
  } catch (error) {
    serverError(res, "Failed to fetch status counters");
  }
};

/**
 * Create a new todo entry
 */
export const createEntry = async (
  req: Request,
  res: Response<BaseResponse<ITodoListEntry>>,
) => {
  const { pb } = req;
  const data = req.body;

  try {
    if (
      data.list &&
      !(await checkExistence(req, res, "todo_lists", data.list))
    ) {
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
  } catch (error) {
    serverError(res, "Failed to create todo entry");
  }
};

/**
 * Update a todo entry
 */
export const updateEntry = async (
  req: Request<{ id: string }>,
  res: Response<
    BaseResponse<Omit<ITodoListEntry, "subtasks"> & { subtasks: string[] }>
  >,
) => {
  const { pb } = req;
  const { id } = req.params;
  const data = req.body;

  try {
    if (!(await checkExistence(req, res, "todo_entries", id))) {
      return;
    }

    if (
      data.list &&
      !(await checkExistence(req, res, "todo_lists", data.list))
    ) {
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
  } catch (error) {
    serverError(res, "Failed to update todo entry");
  }
};

/**
 * Delete a todo entry
 */
export const deleteEntry = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<undefined>>,
) => {
  const { pb } = req;
  const { id } = req.params;

  try {
    if (!(await checkExistence(req, res, "todo_entries", id))) {
      return;
    }

    await entriesService.deleteEntry(pb, id);
    successWithBaseResponse(res, undefined, 204);
  } catch (error) {
    serverError(res, "Failed to delete todo entry");
  }
};

/**
 * Toggle completion status of a todo entry
 */
export const toggleEntry = async (
  req: Request<{ id: string }>,
  res: Response<
    BaseResponse<Omit<ITodoListEntry, "subtasks"> & { subtasks: string[] }>
  >,
) => {
  const { pb } = req;
  const { id } = req.params;

  try {
    if (!(await checkExistence(req, res, "todo_entries", id))) {
      return;
    }

    const entry = await entriesService.toggleEntry(pb, id);
    successWithBaseResponse(res, entry);
  } catch (error) {
    serverError(res, "Failed to toggle todo entry");
  }
};
