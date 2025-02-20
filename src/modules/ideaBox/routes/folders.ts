import express, { Response } from "express";
import asyncWrapper from "../../../utils/asyncWrapper";
import { clientError, successWithBaseResponse } from "../../../utils/response";
import { body, param, query } from "express-validator";
import hasError from "../../../utils/checkError";
import { list } from "../../../utils/CRUD";
import { BaseResponse } from "../../../interfaces/base_response";
import { IIdeaBoxFolder } from "../../../interfaces/ideabox_interfaces";
import { checkExistence } from "../../../utils/PBRecordValidator";

const router = express.Router();

/**
 * @protected
 * @summary Get a list of all idea box folders
 * @description Retrieve a list of all idea box folders, filtered by the container ID given in the query.
 * @query container (string, required) - The ID of the container
 * @response 200 (IIdeaBoxFolder[]) - The list of idea box folders
 */
router.get(
  "/:container/*",
  [param("container").isString()],
  asyncWrapper(async (req, res: Response<BaseResponse<IIdeaBoxFolder[]>>) => {
    const { pb } = req;
    const { container } = req.params;
    const path = req.params[0].split("/").filter((p) => p !== "");

    const containerExists = await checkExistence(
      req,
      res,
      "idea_box_containers",
      container
    );

    let folderExists = true;
    let lastFolder = "";

    for (const folder of path) {
      if (!(await checkExistence(req, res, "idea_box_folders", folder))) {
        folderExists = false;
        break;
      }

      const folderEntry = await pb
        .collection("idea_box_folders")
        .getOne<IIdeaBoxFolder>(folder);

      if (
        folderEntry.parent !== lastFolder ||
        folderEntry.container !== container
      ) {
        folderExists = false;
        break;
      }

      lastFolder = folder;
    }

    if (!containerExists || !folderExists) {
      try {
        clientError(res, "folder: Not found", 400);
      } catch {}
      return;
    }

    list(req, res, "idea_box_folders", {
      filter: `container = "${container}" && parent = "${lastFolder}"`,
      sort: "name",
    });
  })
);

/**
 * @protected
 * @summary Create a new idea box folder
 * @description Create a new idea box folder with the given name, container, icon, and color.
 * @body name (string, required) - The name of the folder
 * @body container (string, required) - The ID of the container
 * @body icon (string, required) - The icon of the folder, can be any icon available in Iconify
 * @body color (string, required) - The color of the folder, in hex format
 * @response 201 (IIdeaBoxFolder) - The created idea box folder
 */
router.post(
  "/",
  [
    body("name").isString(),
    body("container").isString(),
    body("parent").isString(),
    body("icon").isString(),
    body("color").isHexColor(),
  ],
  asyncWrapper(async (req, res: Response<BaseResponse<IIdeaBoxFolder>>) => {
    const { pb } = req;
    const { name, container, icon, color } = req.body;

    if (!(await checkExistence(req, res, "idea_box_containers", container)))
      return;

    const folder: IIdeaBoxFolder = await pb
      .collection("idea_box_folders")
      .create({
        name,
        container,
        parent: req.body.parent,
        icon,
        color,
      });

    successWithBaseResponse(res, folder, 201);
  })
);

/**
 * @protected
 * @summary Update an idea box folder
 * @description Update an existing idea box folder with the given ID, setting the name, icon, and color.
 * @param id (string, required, must_exist) - The ID of the idea box folder to update
 * @body name (string, required) - The name of the folder
 * @body icon (string, required) - The icon of the folder, can be any icon available in Iconify
 * @body color (string, required) - The color of the folder, in hex format
 * @response 200 (IIdeaBoxFolder) - The updated idea box folder
 */
router.patch(
  "/:id",
  [
    body("name").isString(),
    body("icon").isString(),
    body("color").isHexColor(),
  ],
  asyncWrapper(async (req, res: Response<BaseResponse<IIdeaBoxFolder>>) => {
    const { pb } = req;
    const { id } = req.params;
    const { name, icon, color } = req.body;

    if (!(await checkExistence(req, res, "idea_box_folders", id))) return;

    const folder: IIdeaBoxFolder = await pb
      .collection("idea_box_folders")
      .update(id, {
        name,
        icon,
        color,
      });

    successWithBaseResponse(res, folder);
  })
);

router.post(
  "/move/:id",
  query("target").isString(),
  asyncWrapper(async (req, res: Response<BaseResponse<IIdeaBoxFolder>>) => {
    const { pb } = req;
    const { id } = req.params;
    const { target } = req.query as Record<string, string>;

    const entryExist = await checkExistence(req, res, "idea_box_folders", id);
    const folderExist = await checkExistence(
      req,
      res,
      "idea_box_folders",
      target
    );
    if (!(entryExist && folderExist)) return;

    const entry: IIdeaBoxFolder = await pb
      .collection("idea_box_folders")
      .update(id, {
        parent: target,
      });

    successWithBaseResponse(res, entry);
  })
);

router.delete(
  "/move/:id",
  asyncWrapper(async (req, res: Response<BaseResponse<IIdeaBoxFolder>>) => {
    const { pb } = req;
    const { id } = req.params;

    if (!(await checkExistence(req, res, "idea_box_folders", id))) return;

    const entry: IIdeaBoxFolder = await pb
      .collection("idea_box_folders")
      .update(id, {
        parent: "",
      });

    successWithBaseResponse(res, entry);
  })
);

/**
 * @protected
 * @summary Delete an idea box folder
 * @description Delete an existing idea box folder with the given ID.
 * @param id (string, required, must_exist) - The ID of the idea box folder to delete
 * @response 204
 */
router.delete(
  "/:id",
  asyncWrapper(async (req, res: Response<BaseResponse>) => {
    const { pb } = req;
    const { id } = req.params;

    if (!(await checkExistence(req, res, "idea_box_folders", id))) return;

    await pb.collection("idea_box_folders").delete(id);

    successWithBaseResponse(res, undefined, 204);
  })
);

export default router;
