import express from "express";
import asyncWrapper from "../../../core/utils/asyncWrapper";
import * as EventsController from "../controllers/events.controller";
import {
  validateEventData,
  validateId,
  validateYearMonth,
} from "../middlewares/eventsValidation";

const router = express.Router();

router.get(
  "/",
  validateYearMonth,
  asyncWrapper(EventsController.getEventsByDateRange),
);

router.get("/today", asyncWrapper(EventsController.getEventsToday));

router.get("/:id", validateId, asyncWrapper(EventsController.getEventById));

router.post("/", validateEventData, asyncWrapper(EventsController.createEvent));

router.patch(
  "/:id",
  validateId,
  validateEventData,
  asyncWrapper(EventsController.updateEvent),
);

router.delete("/:id", validateId, asyncWrapper(EventsController.deleteEvent));

export default router;
