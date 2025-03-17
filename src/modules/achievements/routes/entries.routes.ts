import express from "express";
import validationMiddleware from "../../../core/middleware/validationMiddleware";
import * as EntriesController from "../controllers/entries.controller";
import {
  validateBodyData,
  validateDifficulty,
  validateId,
} from "../middlewares/entriesValidation";

const router = express.Router();

/**
 * @protected
 * @summary Get a list of all achievements entries by difficulty
 * @description Retrieve a list of all achievements entries, filtered by difficulty level given in the URL.
 * @param difficulty (string, required, one_of easy|medium|hard|impossible) - The difficulty of the achievement
 * @response 200 (IAchievementEntry[]) - The list of achievements entries
 */
router.get(
  "/:difficulty",
  validateDifficulty,
  validationMiddleware,
  EntriesController.getAllEntriesByDifficulty,
);

/**
 * @protected
 * @summary Create a new achievement entry
 * @description Create a new achievement entry with the given difficulty, title, and thoughts.
 * @body difficulty (string, required, one_of easy|medium|hard|impossible) - The difficulty of the achievement
 * @body title (string, required) - The title of the achievement
 * @body thoughts (string, required) - The thoughts on the achievement
 * @response 201 (IAchievementEntry) - The created achievement entry
 */
router.post(
  "/",
  validateBodyData,
  validationMiddleware,
  EntriesController.createEntry,
);

/**
 * @protected
 * @summary Update an achievement entry
 * @description Update an existing achievement entry with the given ID, setting the difficulty, title, and thoughts.
 * @param id (string, required, must_exist) - The ID of the achievement entry to update
 * @body difficulty (string, required, one_of easy|medium|hard|impossible) - The difficulty of the achievement
 * @body title (string, required) - The title of the achievement
 * @body thoughts (string, required) - The thoughts on the achievement
 * @response 200 (IAchievementEntry) - The updated achievement entry
 */
router.patch(
  "/:id",
  validateId,
  validateBodyData,
  validationMiddleware,
  EntriesController.updateEntry,
);

/**
 * @protected
 * @summary Delete an achievement entry
 * @description Delete an existing achievement entry with the given ID.
 * @param id (string, required, must_exist) - The ID of the achievement entry to delete
 * @response 204 - The achievement entry was deleted successfully
 */
router.delete(
  "/:id",
  validateId,
  validationMiddleware,
  EntriesController.deleteEntry,
);

export default router;
