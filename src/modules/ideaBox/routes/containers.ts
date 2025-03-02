import express, { Response } from "express";
import { clientError, successWithBaseResponse } from "../../../utils/response";
import asyncWrapper from "../../../utils/asyncWrapper";
import { body } from "express-validator";
import { list, validate } from "../../../utils/CRUD";
import { IIdeaBoxContainer } from "../../../interfaces/ideabox_interfaces";
import { BaseResponse } from "../../../interfaces/base_response";
import { checkExistence } from "../../../utils/PBRecordValidator";
import hasError from "../../../utils/checkError";
import {
  singleUploadMiddleware,
  singleUploadMiddlewareOfKey,
} from "../../../middleware/uploadMiddleware";
import fs from "fs";

const router = express.Router();

/**
 * @protected
 * @summary Check if an idea box container exists
 * @description Check if an idea box container exists by its ID.
 * @param id (string, required) - The ID of the idea box container
 * @response 200 (boolean) - Whether the idea box container exists
 */
router.get(
  "/valid/:id",
  asyncWrapper(async (req, res) => validate(req, res, "idea_box_containers"))
);

/**
 * @protected
 * @summary Get a list of all idea box containers
 * @description Retrieve a list of all idea box containers.
 * @response 200 (IIdeaBoxContainer[]) - The list of idea box containers
 */
router.get(
  "/",
  asyncWrapper(async (req, res: Response<BaseResponse<IIdeaBoxContainer[]>>) =>
    list(req, res, "idea_box_containers", {}, (data) =>
      data.map((d) => ({
        ...d,
        cover: d.cover
          ? req.pb.files
              .getURL(d, d.cover)
              .replace(`${req.pb.baseURL}/api/files`, "")
          : "",
      }))
    )
  )
);

/**
 * @protected
 * @summary Create a new idea box container
 * @description Create a new idea box container with the given name, color, and icon.
 * @body name (string, required) - The name of the container
 * @body color (string, required) - The color of the container
 * @body icon (string) - The icon of the container
 * @response 201 (IIdeaBoxContainer) - The created idea box container
 */
router.post(
  "/",
  singleUploadMiddlewareOfKey("cover"),
  asyncWrapper(async (req, res: Response<BaseResponse<IIdeaBoxContainer>>) => {
    const { pb } = req;
    const { name, color, icon } = req.body;

    if (req.file) {
      const fileBuffer = fs.readFileSync(req.file.path);

      const container: IIdeaBoxContainer = await pb
        .collection("idea_box_containers")
        .create({
          name,
          color,
          icon,
          cover: new File([fileBuffer], req.file.filename),
        });

      if (container.cover) {
        container.cover = req.pb.files
          .getURL(container, container.cover)
          .replace(`${req.pb.baseURL}/api/files`, "");
      }

      successWithBaseResponse(res, container, 201);
      fs.unlinkSync(req.file.path);
      return;
    }

    const url = req.body.cover;

    if (url) {
      fetch(url)
        .then(async (response) => {
          const fileBuffer = await response.arrayBuffer();
          const newEntry: IIdeaBoxContainer = await pb
            .collection("idea_box_containers")
            .create({
              name,
              color,
              icon,
              cover: new File([fileBuffer], "cover.jpg"),
            });

          if (newEntry.cover) {
            newEntry.cover = req.pb.files
              .getURL(newEntry, newEntry.cover)
              .replace(`${req.pb.baseURL}/api/files`, "");
          }

          successWithBaseResponse(res, newEntry, 201);
        })
        .catch(() => {
          clientError(res, "Invalid file");
        });
    } else {
      const container: IIdeaBoxContainer = await pb
        .collection("idea_box_containers")
        .create({
          name,
          color,
          icon,
          cover: "",
        });

      successWithBaseResponse(res, container, 201);
    }
  })
);

/**
 * @protected
 * @summary Update an idea box container
 * @description Update an idea box container with the given name, color, and icon.
 * @param id (string, required) - The ID of the idea box container
 * @body name (string, required) - The name of the container
 * @body color (string, required) - The color of the container
 * @body icon (string) - The icon of the container
 * @response 200 (IIdeaBoxContainer) - The updated idea box container
 */
router.patch(
  "/:id",
  singleUploadMiddlewareOfKey("cover"),
  asyncWrapper(async (req, res: Response<BaseResponse<IIdeaBoxContainer>>) => {
    const { pb } = req;
    const { id } = req.params;

    const { name, color, icon } = req.body;

    if (!(await checkExistence(req, res, "idea_box_containers", id))) {
      if (req.file) fs.unlinkSync(req.file.path);
      return;
    }

    if (req.file) {
      const fileBuffer = fs.readFileSync(req.file.path);

      const container: IIdeaBoxContainer = await pb
        .collection("idea_box_containers")
        .update(id, {
          name,
          color,
          icon,
          cover: new File([fileBuffer], req.file.filename),
        });

      if (container.cover) {
        container.cover = req.pb.files
          .getURL(container, container.cover)
          .replace(`${req.pb.baseURL}/api/files`, "");
      }

      successWithBaseResponse(res, container);

      fs.unlinkSync(req.file.path);
      return;
    } else {
      const url = req.body.cover;

      if (url === "keep") {
        const container: IIdeaBoxContainer = await pb
          .collection("idea_box_containers")
          .update(id, {
            name,
            color,
            icon,
          });

        if (container.cover) {
          container.cover = req.pb.files
            .getURL(container, container.cover)
            .replace(`${req.pb.baseURL}/api/files`, "");
        }

        successWithBaseResponse(res, container);
      } else if (url) {
        fetch(url)
          .then(async (response) => {
            const fileBuffer = await response.arrayBuffer();
            const newEntry: IIdeaBoxContainer = await pb
              .collection("idea_box_containers")
              .update(id, {
                name,
                color,
                icon,
                cover: new File([fileBuffer], "cover.jpg"),
              });

            if (newEntry.cover) {
              newEntry.cover = req.pb.files
                .getURL(newEntry, newEntry.cover)
                .replace(`${req.pb.baseURL}/api/files`, "");
            }

            successWithBaseResponse(res, newEntry);
          })
          .catch(() => {
            clientError(res, "Invalid file");
          });
      } else {
        const container: IIdeaBoxContainer = await pb
          .collection("idea_box_containers")
          .update(id, {
            name,
            color,
            icon,
            cover: "",
          });

        successWithBaseResponse(res, container);
      }
    }
  })
);

/**
 * @protected
 * @summary Delete an idea box container
 * @description Delete an idea box container by its ID.
 * @param id (string, required) - The ID of the idea box container
 * @response 204
 */
router.delete(
  "/:id",
  asyncWrapper(async (req, res: Response<BaseResponse>) => {
    const { pb } = req;
    const { id } = req.params;

    if (!(await checkExistence(req, res, "idea_box_containers", id))) return;

    await pb.collection("idea_box_containers").delete(id);

    successWithBaseResponse(res, undefined, 204);
  })
);

export default router;
