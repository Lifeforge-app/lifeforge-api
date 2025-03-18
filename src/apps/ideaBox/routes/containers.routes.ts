import express from "express";
import { singleUploadMiddlewareOfKey } from "../../../core/middleware/uploadMiddleware";
import asyncWrapper from "../../../core/utils/asyncWrapper";
import * as containersController from "../controllers/containers.controller";
import {
  validateContainerId,
  validateCreateContainer,
  validateUpdateContainer,
} from "../middleware/containersValidation";

const router = express.Router();

router.get(
  "/valid/:id",
  validateContainerId,
  asyncWrapper(containersController.checkContainerExists),
);

router.get("/", asyncWrapper(containersController.getContainers));

router.post(
  "/",
  singleUploadMiddlewareOfKey("cover"),
  validateCreateContainer,
  asyncWrapper(containersController.createContainer),
);

router.patch(
  "/:id",
  singleUploadMiddlewareOfKey("cover"),
  validateUpdateContainer,
  asyncWrapper(containersController.updateContainer),
);

router.delete(
  "/:id",
  validateContainerId,
  asyncWrapper(containersController.deleteContainer),
);

export default router;
