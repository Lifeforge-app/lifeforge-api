// @ts-nocheck
import express from "express";
import validationMiddleware from "../../middleware/validationMiddleware";
import * as CodeTimeController from "./controllers/codeTimeController";
import {
  validateDays,
  validateLastXDays,
  validateMinutes,
} from "./middlewares/codeTimeValidation";

const router = express.Router();

router.get("/activities", CodeTimeController.getActivities);

router.get("/statistics", CodeTimeController.getStatistics);

router.get(
  "/last-x-days",
  validateDays,
  validationMiddleware,
  CodeTimeController.getLastXDays,
);

router.get(
  "/projects",
  validateLastXDays,
  validationMiddleware,
  CodeTimeController.getProjects,
);

router.get(
  "/languages",
  validateLastXDays,
  validationMiddleware,
  CodeTimeController.getLanguages,
);

router.get("/each-day", CodeTimeController.getEachDay);

router.get(
  "/user/minutes",
  validateMinutes,
  validationMiddleware,
  CodeTimeController.getUserMinutes,
);

router.post("/eventLog", CodeTimeController.logEvent);

export default router;
