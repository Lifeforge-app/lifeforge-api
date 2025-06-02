import express from "express";

import { singleUploadMiddleware } from "@middlewares/uploadMiddleware";

import * as EventsController from "../controllers/events.controller";

const router = express.Router();

router.get("/", EventsController.getEventsByDateRange);

router.get("/today", EventsController.getEventsToday);

router.get("/:id", EventsController.getEventById);

router.post("/", EventsController.createEvent);

router.post("/scan-image", singleUploadMiddleware, EventsController.scanImage);

router.post("/exception/:id", EventsController.addException);

router.patch("/:id", EventsController.updateEvent);

router.delete("/:id", EventsController.deleteEvent);

export default router;
