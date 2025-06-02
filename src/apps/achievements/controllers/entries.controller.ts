import { BaseResponse } from "@typescript/base_response";
import { checkExistence } from "@utils/PBRecordValidator";
import { successWithBaseResponse } from "@utils/response";
import { Request, Response } from "express";
import * as EntriesService from "../services/entries.service";
import { IAchievementEntry } from "../typescript/achievements_interfaces";

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

  await EntriesService.deleteEntry(pb, id);
  successWithBaseResponse(res, undefined, 204);
};
