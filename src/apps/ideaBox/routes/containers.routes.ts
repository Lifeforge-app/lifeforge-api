import express from "express";

import { singleUploadMiddlewareOfKey } from "@middlewares/uploadMiddleware";

import * as containersController from "../controllers/containers.controller";

const router = express.Router();

router.get("/valid/:id", containersController.checkContainerExists);

router.get("/", containersController.getContainers);

router.post(
  "/",
  singleUploadMiddlewareOfKey("cover"),
  containersController.createContainer,
);

router.patch(
  "/:id",
  singleUploadMiddlewareOfKey("cover"),
  containersController.updateContainer,
);

router.delete("/:id", containersController.deleteContainer);

export default router;
