import express from "express";
import { singleUploadMiddlewareOfKey } from "../../../middleware/uploadMiddleware";
import validationMiddleware from "../../../middleware/validationMiddleware";
import * as containersController from "../controllers/containersController";
import {
  validateContainerId,
  validateCreateContainer,
  validateUpdateContainer,
} from "../middleware/containersValidation";

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
  validateContainerId,
  validationMiddleware,
  containersController.checkContainerExists,
);

/**
 * @protected
 * @summary Get a list of all idea box containers
 * @description Retrieve a list of all idea box containers.
 * @response 200 (IIdeaBoxContainer[]) - The list of idea box containers
 */
router.get("/", containersController.getContainers);

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
  validateCreateContainer,
  validationMiddleware,
  containersController.createContainer,
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
  validateUpdateContainer,
  validationMiddleware,
  containersController.updateContainer,
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
  validateContainerId,
  validationMiddleware,
  containersController.deleteContainer,
);

export default router;
