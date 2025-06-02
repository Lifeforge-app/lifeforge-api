import express from "express";

import * as CalendarsController from "../controllers/calendars.controller";

const router = express.Router();

router.get("/", CalendarsController.getAllCalendars);

router.get("/:id", CalendarsController.getCalendarById);

router.post("/", CalendarsController.createCalendar);

router.patch("/:id", CalendarsController.updateCalendar);

router.delete("/:id", CalendarsController.deleteCalendar);

export default router;
