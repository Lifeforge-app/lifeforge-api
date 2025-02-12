import express, { Request, Response } from "express";
import asyncWrapper from "../../../utils/asyncWrapper.js";
import { successWithBaseResponse } from "../../../utils/response.js";
import { body, param } from "express-validator";
import hasError from "../../../utils/checkError.js";
import { list } from "../../../utils/CRUD.js";
import { BaseResponse } from "../../../interfaces/base_response.js";
import { IAchievementEntry } from "../../../interfaces/achievements_interfaces.js";
import { checkExistence } from "../../../utils/PBRecordValidator.js";

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
  param("difficulty").isString().isIn(["easy", "medium", "hard", "impossible"]),
  asyncWrapper(async (req, res: Response<BaseResponse<IAchievementEntry[]>>) =>
    list<IAchievementEntry>(req, res, "achievements_entries", {
      filter: `difficulty = "${req.params.difficulty}"`,
    })
  )
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
  [
    body("difficulty")
      .exists()
      .isString()
      .isIn(["easy", "medium", "hard", "impossible"]),
    body("title").isString(),
    body("thoughts").isString(),
  ],
  asyncWrapper(async (req, res: Response<BaseResponse<IAchievementEntry>>) => {
    if (hasError(req, res)) return;

    const { pb } = req;
    const { difficulty, title, thoughts } = req.body;

    const achievement: IAchievementEntry = await pb
      .collection("achievements_entries")
      .create({
        difficulty,
        title,
        thoughts,
      });

    successWithBaseResponse(res, achievement, 201);
  })
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
  [
    body("difficulty")
      .exists()
      .isString()
      .isIn(["easy", "medium", "hard", "impossible"]),
    body("title").exists().notEmpty(),
    body("thoughts").exists().notEmpty(),
  ],
  asyncWrapper(async (req, res) => {
    if (hasError(req, res)) return;

    const { pb } = req;
    const { id } = req.params;
    const { difficulty, title, thoughts } = req.body;

    if (!(await checkExistence(req, res, "achievements_entries", id, "id")))
      return;

    const achievement: IAchievementEntry = await pb
      .collection("achievements_entries")
      .update(id, {
        difficulty,
        title,
        thoughts,
      });

    successWithBaseResponse(res, achievement);
  })
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
  [param("id").isString()],
  asyncWrapper(async (req, res) => {
    if (hasError(req, res)) return;

    const { pb } = req;
    const { id } = req.params;

    if (!(await checkExistence(req, res, "achievements_entries", id, "id")))
      return;

    await pb.collection("achievements_entries").delete(id);

    successWithBaseResponse(res, undefined, 204);
  })
);

export default router;
