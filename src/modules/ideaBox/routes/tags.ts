import express, { Response } from "express";
import { body, param } from "express-validator";
import { BaseResponse } from "../../../interfaces/base_response";
import { IIdeaBoxTag } from "../../../interfaces/ideabox_interfaces";
import asyncWrapper from "../../../utils/asyncWrapper";
import { list } from "../../../utils/CRUD";
import { checkExistence } from "../../../utils/PBRecordValidator";
import { successWithBaseResponse } from "../../../utils/response";

const router = express.Router();

/**
 * @protected
 * @summary Get a list of all tags tags
 * @description Retrieve a list of all tags tags.
 * @response 200 (IIdeaBoxTag[]) - The list of tags tags
 */
router.get(
  "/:container",
  [param("container").isString()],
  asyncWrapper(async (req, res: Response<BaseResponse<IIdeaBoxTag[]>>) => {
    const { container } = req.params;

    if (!(await checkExistence(req, res, "idea_box_containers", container)))
      return;

    list(req, res, "idea_box_tags", {
      filter: `container = "${container}"`,
    });
  }),
);

/**
 * @protected
 * @summary Create a new tags tag
 * @description Create a new tags tag with the given name and icon.
 * @body name (string, required) - The name of the tag
 * @body icon (string, required) - The icon of the tag, can be any icon available in Iconify
 * @response 201 (IIdeaBoxTag) - The created tags tag
 */
router.post(
  "/:container",
  [
    param("container").isString(),
    body("name").isString(),
    body("icon").isString(),
  ],
  asyncWrapper(async (req, res: Response<BaseResponse<IIdeaBoxTag>>) => {
    const { pb } = req;
    const { container } = req.params;
    const { name, icon, color } = req.body;

    if (!(await checkExistence(req, res, "idea_box_containers", container)))
      return;

    const tag: IIdeaBoxTag = await pb.collection("idea_box_tags").create({
      name,
      icon,
      color,
      container,
    });

    successWithBaseResponse(res, tag);
  }),
);

/**
 * @protected
 * @summary Update a tags tag
 * @description Update a tags tag with the given name and icon.
 * @param id (string, required, must_exist) - The ID of the tags tag
 * @body name (string, required) - The name of the tag
 * @body icon (string, required) - The icon of the tag, can be any icon available in Iconify
 * @response 200 (IIdeaBoxTag) - The updated tags tag
 */
router.patch(
  "/:id",
  asyncWrapper(async (req, res: Response<BaseResponse<IIdeaBoxTag>>) => {
    const { pb } = req;
    const { id } = req.params;
    const { name, icon, color } = req.body;

    const tag: IIdeaBoxTag = await pb.collection("idea_box_tags").update(id, {
      name,
      icon,
      color,
    });

    successWithBaseResponse(res, tag);
  }),
);

/**
 * @protected
 * @summary Delete a tags tag
 * @description Delete a tags tag with the given ID.
 * @param id (string, required, must_exist) - The ID of the tags tag
 * @response 200 - The tags tag was successfully deleted
 */
router.delete(
  "/:id",
  asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { id } = req.params;

    await pb.collection("idea_box_tags").delete(id);

    successWithBaseResponse(res);
  }),
);

export default router;
