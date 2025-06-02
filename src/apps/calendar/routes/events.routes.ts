import express from "express";

import { singleUploadMiddleware } from "@middlewares/uploadMiddleware";

import asyncWrapper from "@utils/asyncWrapper";

import * as EventsController from "../controllers/events.controller";
import {
  validateEventData,
  validateExceptionDate,
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

router.post(
  "/scan-image",
  singleUploadMiddleware,
  asyncWrapper(EventsController.scanImage),
);

router.post(
  "/exception/:id",
  validateId,
  validateExceptionDate,
  asyncWrapper(EventsController.addException),
);

router.patch(
  "/:id",
  validateId,
  validateEventData,
  asyncWrapper(EventsController.updateEvent),
);

router.delete("/:id", validateId, asyncWrapper(EventsController.deleteEvent));

export default router;
