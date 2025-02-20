import express, { Response } from "express";
import asyncWrapper from "../../../utils/asyncWrapper";
import { successWithBaseResponse } from "../../../utils/response";
import { list, validate } from "../../../utils/CRUD";
import { BaseResponse } from "../../../interfaces/base_response";
import { IProjectsMEntry } from "../../../interfaces/projects_m_interfaces";
import { body } from "express-validator";
import hasError from "../../../utils/checkError";
import { checkExistence } from "../../../utils/PBRecordValidator";

const router = express.Router();

/**
 * @protected
 * @summary Get a list of all projects entries
 * @description Retrieve a list of all projects entries.
 * @response 200 (IProjectsMEntry[]) - The list of projects entries
 */
router.get(
  "/",
  asyncWrapper(async (req, res: Response<BaseResponse<IProjectsMEntry[]>>) =>
    list(req, res, "projects_m_entries")
  )
);

/**
 * @protected
 * @summary Get a single projects entry
 * @description Retrieve a single projects entry by its ID.
 * @param id (string, required, must_exist) - The ID of the projects entry
 * @response 200 (IProjectsMEntry) - The projects entry
 */
router.get(
  "/:id",
  asyncWrapper(async (req, res: Response<BaseResponse<IProjectsMEntry>>) => {
    const { pb } = req;
    const { id } = req.params;

    const entry: IProjectsMEntry = await pb
      .collection("projects_m_entries")
      .getOne(id);

    successWithBaseResponse(res, entry);
  })
);

/**
 * @protected
 * @summary Validate a projects entry
 * @description Check if a projects entry exists.
 * @param id (string, required, must_exist) - The ID of the projects entry
 * @response 200 (boolean) - Whether the projects entry exists
 */
router.get(
  "/valid/:id",
  asyncWrapper(async (req, res) => validate(req, res, "projects_m_entries"))
);

/**
 * @protected
 * @summary Create a new projects entry
 * @description Create a new projects entry with the given name, icon, color, visibility, status, category, and technologies.
 * @body name (string, required) - The name of the entry
 * @body icon (string, required) - The icon of the entry, can be any icon available in Iconify
 * @body color (string, required) - The color of the entry, in hex format
 * @body visibility (string, required, must_exist) - The visibility of the entry
 * @body status (string, required, must_exist) - The status of the entry
 * @body category (string, required, must_exist) - The category of the entry
 * @body technologies (string[], required, must_exist) - The technologies of the entry
 * @response 201 (IProjectsMEntry) - The created projects entry
 */
router.post(
  "/",
  [
    body("name").isString(),
    body("icon").isString(),
    body("color").isHexColor(),
    body("visibility").isString().optional(),
    body("status").isString().optional(),
    body("category").isString().optional(),
    body("technologies").isArray().optional(),
  ],
  asyncWrapper(async (req, res: Response<BaseResponse<IProjectsMEntry>>) => {
    const { pb } = req;
    const { name, icon, color, visibility, status, category, technologies } =
      req.body;

    const visibilityExists = await checkExistence(
      req,
      res,
      "projects_m_visibilities",
      visibility
    );
    const statusExists = await checkExistence(
      req,
      res,
      "projects_m_statuses",
      status
    );
    const categoryExists = await checkExistence(
      req,
      res,
      "projects_m_categories",
      category
    );

    let technologiesExist = true;

    for (const tech of technologies || []) {
      const techExists = await checkExistence(
        req,
        res,
        "projects_m_technologies",
        tech
      );

      if (!techExists) {
        technologiesExist = false;
        break;
      }
    }

    if (
      !visibilityExists ||
      !statusExists ||
      !categoryExists ||
      !technologiesExist
    ) {
      return;
    }

    const entry: IProjectsMEntry = await pb
      .collection("projects_m_entries")
      .create({
        name,
        icon,
        color,
        visibility,
        status,
        category,
        technologies,
      });

    successWithBaseResponse(res, entry);
  })
);

/**
 * @protected
 * @summary Update a projects entry
 * @description Update a projects entry with the given name, icon, color, visibility, status, category, and technologies.
 * @param id (string, required, must_exist) - The ID of the projects entry
 * @body name (string, required) - The name of the entry
 * @body icon (string, required) - The icon of the entry, can be any icon available in Iconify
 * @body color (string, required) - The color of the entry, in hex format
 * @body visibility (string, required, must_exist) - The visibility of the entry
 * @body status (string, required, must_exist) - The status of the entry
 * @body category (string, required, must_exist) - The category of the entry
 * @body technologies (string[], required, must_exist) - The technologies of the entry
 * @response 200 (IProjectsMEntry) - The updated projects entry
 */
router.patch(
  "/:id",
  [
    body("name").isString(),
    body("icon").isString(),
    body("color").isHexColor(),
    body("visibility").isString().optional(),
    body("status").isString().optional(),
    body("category").isString().optional(),
    body("technologies").isArray().optional(),
  ],
  asyncWrapper(async (req, res: Response<BaseResponse<IProjectsMEntry>>) => {
    const { pb } = req;
    const { id } = req.params;
    const { name, icon, color, visibility, status, category, technologies } =
      req.body;

    const visibilityExists = await checkExistence(
      req,
      res,
      "projects_m_visibilities",
      visibility
    );
    const statusExists = await checkExistence(
      req,
      res,
      "projects_m_statuses",
      status
    );
    const categoryExists = await checkExistence(
      req,
      res,
      "projects_m_categories",
      category
    );

    let technologiesExist = true;

    for (const tech of technologies || []) {
      const techExists = await checkExistence(
        req,
        res,
        "projects_m_technologies",
        tech
      );

      if (!techExists) {
        technologiesExist = false;
        break;
      }
    }

    if (
      !visibilityExists ||
      !statusExists ||
      !categoryExists ||
      !technologiesExist
    ) {
      return;
    }

    const entries: IProjectsMEntry = await pb
      .collection("projects_m_entries")
      .update(id, {
        name,
        icon,
        color,
        visibility,
        status,
        category,
        technologies,
      });

    successWithBaseResponse(res, entries);
  })
);

/**
 * @protected
 * @summary Delete a projects entry
 * @description Delete a projects entry with the given ID.
 * @param id (string, required, must_exist) - The ID of the projects entry
 * @response 200 - The projects entry was successfully deleted
 */
router.delete(
  "/:id",
  asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { id } = req.params;

    await pb.collection("projects_m_entries").delete(id);

    successWithBaseResponse(res);
  })
);

export default router;
