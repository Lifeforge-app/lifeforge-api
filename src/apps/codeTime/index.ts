// @ts-nocheck
import express from "express";

import asyncWrapper from "@utils/asyncWrapper";

import * as CodeTimeController from "./controllers/codeTime.controller";
import {
  validateDays,
  validateLastXDays,
  validateMinutes,
} from "./middlewares/codeTimeValidation";

const router = express.Router();

router.get("/activities", asyncWrapper(CodeTimeController.getActivities));

router.get("/statistics", asyncWrapper(CodeTimeController.getStatistics));

router.get(
  "/last-x-days",
  validateDays,
  asyncWrapper(CodeTimeController.getLastXDays),
);

router.get(
  "/projects",
  validateLastXDays,
  asyncWrapper(CodeTimeController.getProjects),
);

router.get(
  "/languages",
  validateLastXDays,
  asyncWrapper(CodeTimeController.getLanguages),
);

router.get("/each-day", asyncWrapper(CodeTimeController.getEachDay));

router.get(
  "/user/minutes",
  validateMinutes,
  asyncWrapper(CodeTimeController.getUserMinutes),
);

router.post("/eventLog", asyncWrapper(CodeTimeController.logEvent));

router.get("/readme", asyncWrapper(CodeTimeController.getReadmeImage));

export default router;
