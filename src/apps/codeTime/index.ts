// @ts-nocheck
import express from "express";

import * as CodeTimeController from "./controllers/codeTime.controller";

const router = express.Router();

router.get("/activities", CodeTimeController.getActivities);

router.get("/statistics", CodeTimeController.getStatistics);

router.get("/last-x-days", CodeTimeController.getLastXDays);

router.get("/projects", CodeTimeController.getProjects);

router.get("/languages", CodeTimeController.getLanguages);

router.get("/each-day", CodeTimeController.getEachDay);

router.get("/user/minutes", CodeTimeController.getUserMinutes);

router.post("/eventLog", CodeTimeController.logEvent);

router.get("/readme", CodeTimeController.getReadmeImage);

export default router;
