import { z } from "zod";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import { checkExistence } from "@utils/PBRecordValidator";
import { zodHandler } from "@utils/asyncWrapper";
import { successWithBaseResponse } from "@utils/response";

import * as EntriesService from "../services/entries.service";
import { AchievementsEntrySchema } from "../typescript/achievements_interfaces";

export const getAllEntriesByDifficulty = zodHandler(
  {
    params: z.object({
      difficulty: AchievementsEntrySchema.shape.difficulty,
    }),
    response: z.array(WithPBSchema(AchievementsEntrySchema)),
  },
  async (req, res) => {
    const { pb } = req;
    const { difficulty } = req.params;

    const achievements = await EntriesService.getAllEntriesByDifficulty(
      pb,
      difficulty,
    );

    successWithBaseResponse(res, achievements);
  },
);

export const createEntry = zodHandler(
  {
    body: AchievementsEntrySchema,
    response: WithPBSchema(AchievementsEntrySchema),
  },
  async (req, res) => {
    const { pb } = req;
    const { difficulty, title, thoughts } = req.body;

    const achievement = await EntriesService.createEntry(pb, {
      difficulty,
      title,
      thoughts,
    });

    successWithBaseResponse(res, achievement, 201);
  },
);

export const updateEntry = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    body: AchievementsEntrySchema,
    response: WithPBSchema(AchievementsEntrySchema),
  },
  async (req, res) => {
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
  },
);

export const deleteEntry = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  },
  async (req, res) => {
    const { pb } = req;
    const { id } = req.params;

    if (!(await checkExistence(req, res, "achievements_entries", id))) {
      return;
    }

    await EntriesService.deleteEntry(pb, id);
    successWithBaseResponse(res, undefined, 204);
  },
);
