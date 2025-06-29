import {
  bulkRegisterControllers,
  forgeController,
} from "@functions/forgeController";
import express from "express";
import { z } from "zod/v4";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import * as EntriesService from "../services/entries.service";
import { AchievementsEntrySchema } from "../typescript/achievements_interfaces";

const achievementsEntriesRouter = express.Router();

const getAllEntriesByDifficulty = forgeController
  .route("GET /:difficulty")
  .description("Get all achievements entries by difficulty")
  .schema({
    params: z.object({
      difficulty: AchievementsEntrySchema.shape.difficulty,
    }),
    response: z.array(WithPBSchema(AchievementsEntrySchema)),
  })
  .callback(({ pb, params: { difficulty } }) =>
    EntriesService.getAllEntriesByDifficulty(pb, difficulty),
  );

const createEntry = forgeController
  .route("POST /")
  .description("Create a new achievements entry")
  .schema({
    body: AchievementsEntrySchema,
    response: WithPBSchema(AchievementsEntrySchema),
  })
  .statusCode(201)
  .callback(({ pb, body }) => EntriesService.createEntry(pb, body));

const updateEntry = forgeController
  .route("PATCH /:id")
  .description("Update an existing achievements entry")
  .schema({
    params: z.object({
      id: z.string(),
    }),
    body: AchievementsEntrySchema,
    response: WithPBSchema(AchievementsEntrySchema),
  })
  .existenceCheck("params", {
    id: "achievements_entries",
  })
  .callback(({ pb, params: { id }, body }) =>
    EntriesService.updateEntry(pb, id, body),
  );

const deleteEntry = forgeController
  .route("DELETE /:id")
  .description("Delete an existing achievements entry")
  .schema({
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  })
  .existenceCheck("params", {
    id: "achievements_entries",
  })
  .statusCode(204)
  .callback(({ pb, params: { id } }) => EntriesService.deleteEntry(pb, id));

bulkRegisterControllers(achievementsEntriesRouter, [
  getAllEntriesByDifficulty,
  createEntry,
  updateEntry,
  deleteEntry,
]);

export default achievementsEntriesRouter;
