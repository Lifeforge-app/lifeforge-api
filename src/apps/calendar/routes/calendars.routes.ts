import express from "express";

import asyncWrapper from "@utils/asyncWrapper";

import * as CalendarsController from "../controllers/calendars.controller";
import {
  validateCalendarData,
  validateId,
} from "../middlewares/calendarsValidation";

const router = express.Router();

router.get("/", asyncWrapper(CalendarsController.getAllCalendars));

router.get(
  "/:id",
  validateId,
  asyncWrapper(CalendarsController.getCalendarById),
);

router.post(
  "/",
  validateCalendarData,
  asyncWrapper(CalendarsController.createCalendar),
);

router.patch(
  "/:id",
  validateId,
  validateCalendarData,
  asyncWrapper(CalendarsController.updateCalendar),
);

router.delete(
  "/:id",
  validateId,
  asyncWrapper(CalendarsController.deleteCalendar),
);

export default router;
