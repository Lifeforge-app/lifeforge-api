import { list, validate } from "@utils/CRUD";
import { checkExistence } from "@utils/PBRecordValidator";
import asyncWrapper from "@utils/asyncWrapper";
import { successWithBaseResponse } from "@utils/response";
import express, { Response } from "express";
import { body } from "express-validator";
import { BaseResponse } from "../../../core/typescript/base_response";
import { IIdeaBoxContainer } from "../../ideaBox/typescript/ideabox_interfaces";
import { IWishlistList } from "../typescript/wishlist_interfaces";

const router = express.Router();

/**
 * @protected
 * @summary Get a single wishlist list
 * @description Retrieve a single wishlist list by its ID.
 * @param id (string, required) - The ID of the wishlist list
 * @response 200
 */
router.get(
  "/:id",
  asyncWrapper(async (req, res: Response<BaseResponse<IWishlistList>>) => {
    const { pb } = req;
    const { id } = req.params;

    if (!(await checkExistence(req, res, "wishlist_lists", id))) {
      return;
    }

    const list: IWishlistList = await pb
      .collection("wishlist_lists")
      .getOne(id);

    successWithBaseResponse(res, list);
  }),
);

/**
 * @protected
 * @summary Check if an wishlist list exists
 * @description Check if an wishlist list exists by its ID.
 * @param id (string, required) - The ID of the wishlist list
 * @response 200 (boolean) - Whether the wishlist list exists
 */
router.get(
  "/valid/:id",
  asyncWrapper(async (req, res) => validate(req, res, "wishlist_lists")),
);

/**
 * @protected
 * @summary Get a list of all wishlist lists
 * @description Retrieve a list of all wishlist lists.
 * @response 200 (IWishlistList[]) - The list of wishlist lists
 */
router.get(
  "/",
  asyncWrapper(async (req, res: Response<BaseResponse<IWishlistList[]>>) =>
    list(req, res, "wishlist_lists"),
  ),
);

/**
 * @protected
 * @summary Create a new wishlist list
 * @description Create a new wishlist list with the given name, color, and icon.
 * @body name (string, required) - The name of the list
 * @body description (string, optional) - The description of the list
 * @body color (string, required) - The color of the list
 * @body icon (string) - The icon of the list
 * @response 201 (IWishlistList) - The created wishlist list
 */
router.post(
  "/",
  [
    body("name").isString(),
    body("description").isString().optional(),
    body("color").notEmpty().isHexColor(),
    body("icon").isString(),
  ],
  asyncWrapper(async (req, res: Response<BaseResponse<IWishlistList>>) => {
    const { pb } = req;
    const { name, description, color, icon } = req.body;

    const list: IWishlistList = await pb.collection("wishlist_lists").create({
      name,
      description,
      color,
      icon,
    });

    successWithBaseResponse(res, list, 201);
  }),
);

/**
 * @protected
 * @summary Update an wishlist list
 * @description Update an wishlist list with the given name, color, and icon.
 * @param id (string, required) - The ID of the wishlist list
 * @body name (string, required) - The name of the list
 * @body description (string, optional) - The description of the list
 * @body color (string, required) - The color of the list
 * @body icon (string) - The icon of the list
 * @response 200 (IWishlistList) - The updated wishlist list
 */
router.patch(
  "/:id",
  [
    body("name").isString(),
    body("description").isString().optional(),
    body("color").notEmpty().isHexColor(),
    body("icon").isString(),
  ],
  asyncWrapper(async (req, res: Response<BaseResponse<IIdeaBoxContainer>>) => {
    const { pb } = req;
    const { id } = req.params;

    const { name, description, color, icon } = req.body;

    if (!(await checkExistence(req, res, "wishlist_lists", id))) {
      return;
    }

    const list: IIdeaBoxContainer = await pb
      .collection("wishlist_lists")
      .update(id, {
        name,
        description,
        color,
        icon,
      });

    successWithBaseResponse(res, list);
  }),
);

/**
 * @protected
 * @summary Delete an wishlist list
 * @description Delete an wishlist list by its ID.
 * @param id (string, required) - The ID of the wishlist list
 * @response 204
 */
router.delete(
  "/:id",
  asyncWrapper(async (req, res: Response<BaseResponse>) => {
    const { pb } = req;
    const { id } = req.params;

    if (!(await checkExistence(req, res, "wishlist_lists", id))) {
      return;
    }

    await pb.collection("wishlist_lists").delete(id);

    successWithBaseResponse(res, undefined, 204);
  }),
);

export default router;
