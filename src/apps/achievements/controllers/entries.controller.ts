import { z } from "zod";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import { zodHandler } from "@utils/asyncWrapper";

import * as EntriesService from "../services/entries.service";
import { AchievementsEntrySchema } from "../typescript/achievements_interfaces";

export const getAllEntriesByDifficulty = zodHandler(
  {
    params: z.object({
      difficulty: AchievementsEntrySchema.shape.difficulty,
    }),
    response: z.array(WithPBSchema(AchievementsEntrySchema)),
  },
  ({ pb, params: { difficulty } }) =>
    EntriesService.getAllEntriesByDifficulty(pb, difficulty),
);

export const createEntry = zodHandler(
  {
    body: AchievementsEntrySchema,
    response: WithPBSchema(AchievementsEntrySchema),
  },
  ({ pb, body }) => EntriesService.createEntry(pb, body),
  {
    statusCode: 201,
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
  ({ pb, params: { id }, body }) => EntriesService.updateEntry(pb, id, body),
  {
    existenceCheck: {
      params: {
        id: "achievements_entries",
      },
    },
  },
);

export const deleteEntry = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  },
  ({ pb, params: { id } }) => EntriesService.deleteEntry(pb, id),
  {
    existenceCheck: {
      params: {
        id: "achievements_entries",
      },
    },
    statusCode: 204,
  },
);
