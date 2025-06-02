import express from "express";

import asyncWrapper from "@utils/asyncWrapper";

import * as guitarWorldController from "../controllers/guitarWorld.controller";
import {
  validateDownloadTab,
  validateGetTabsList,
} from "../middleware/entriesValidation";

const router = express.Router();

router.post(
  "/",
  validateGetTabsList,
  asyncWrapper(guitarWorldController.getTabsList),
);

router.post(
  "/download",
  validateDownloadTab,
  asyncWrapper(guitarWorldController.downloadTab),
);

export default router;
