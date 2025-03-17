import { Request, Response } from "express";
import { IAchievementEntry } from "../../../interfaces/achievements_interfaces";
import { BaseResponse } from "../../../interfaces/base_response";
import { checkExistence } from "../../../utils/PBRecordValidator";
import { serverError, successWithBaseResponse } from "../../../utils/response";
import * as EntriesService from "../services/entriesService";

export const getAllEntriesByDifficulty = async (
  req: Request<{ difficulty: "easy" | "medium" | "hard" | "impossible" }>,
  res: Response<BaseResponse<IAchievementEntry[]>>,
) => {
  const { pb } = req;
  const { difficulty } = req.params;

  const achievements = await EntriesService.getAllEntriesByDifficulty(
    pb,
    difficulty,
  );

  if (!achievements) {
    serverError(res, "Failed to fetch achievements");
    return;
  }

  successWithBaseResponse(res, achievements);
};

export const createEntry = async (
  req: Request,
  res: Response<BaseResponse<IAchievementEntry>>,
) => {
  const { pb } = req;
  const { difficulty, title, thoughts } = req.body;

  const achievement = await EntriesService.createEntry(pb, {
    difficulty,
    title,
    thoughts,
  });

  if (!achievement) {
    serverError(res, "Failed to create achievement");
    return;
  }

  successWithBaseResponse(res, achievement, 201);
};

export const updateEntry = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<IAchievementEntry>>,
) => {
  const { pb } = req;
  const { id } = req.params;
  const { difficulty, title, thoughts } = req.body;

  if (!(await checkExistence(req, res, "achievements_entries", id))) {
    return;
  }

  const achievement = await EntriesService.updateEntry(pb, id, {
    difficulty,
    title,
    thoughts,
  });

  if (!achievement) {
    serverError(res, "Failed to update achievement");
    return;
  }

  successWithBaseResponse(res, achievement);
};

export const deleteEntry = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<undefined>>,
) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "achievements_entries", id))) {
    return;
  }

  const isDeleted = await EntriesService.deleteEntry(pb, id);

  if (!isDeleted) {
    serverError(res, "Failed to delete achievement");
    return;
  }

  successWithBaseResponse(res, undefined, 204);
};
