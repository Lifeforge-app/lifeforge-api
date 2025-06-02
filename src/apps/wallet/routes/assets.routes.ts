import express from "express";

import asyncWrapper from "@utils/asyncWrapper";

import * as AssetsController from "../controllers/assets.controller";
import { validateBodyData, validateId } from "../middlewares/assetsValidation";

const router = express.Router();

router.get("/", asyncWrapper(AssetsController.getAllAssets));

router.post("/", validateBodyData, asyncWrapper(AssetsController.createAsset));

router.patch(
  "/:id",
  validateId,
  validateBodyData,
  asyncWrapper(AssetsController.updateAsset),
);

router.delete("/:id", validateId, asyncWrapper(AssetsController.deleteAsset));

export default router;
