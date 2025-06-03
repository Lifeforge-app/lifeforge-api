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
  ({ pb, params }) =>
    EntriesService.getAllEntriesByDifficulty(pb, params.difficulty),
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
  ({ pb, params, body }) => EntriesService.updateEntry(pb, params.id, body),
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
  ({ pb, params }) => EntriesService.deleteEntry(pb, params.id),
  {
    existenceCheck: {
      params: {
        id: "achievements_entries",
      },
    },
    statusCode: 204,
  },
);
