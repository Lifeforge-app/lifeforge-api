import express from "express";

import asyncWrapper from "@utils/asyncWrapper";

import * as miscController from "../controllers/misc.controller";
import {
  validateCheckValid,
  validateGetOgData,
  validateGetPath,
  validateSearch,
} from "../middleware/miscValidation";

const router = express.Router();

router.get(
  "/path/:container/*",
  validateGetPath,
  asyncWrapper(miscController.getPath),
);

router.get(
  "/valid/:container/*",
  validateCheckValid,
  asyncWrapper(miscController.checkValid),
);

router.get(
  "/og-data/:id",
  validateGetOgData,
  asyncWrapper(miscController.getOgData),
);

router.get("/search", validateSearch, asyncWrapper(miscController.search));

export default router;
