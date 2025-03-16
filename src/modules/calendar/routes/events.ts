import express from "express";
import validationMiddleware from "../../../middleware/validationMiddleware";
import * as EventsController from "../controllers/eventsController";
import {
  validateEventData,
  validateId,
  validateYearMonth,
} from "../middlewares/eventsValidation";

const router = express.Router();

/**
 * @protected
 * @summary Get calendar events by date range
 * @description Retrieve calendar events within a specified date range
 * @query startDate (string, required) - The start date in ISO format (YYYY-MM-DD)
 * @query endDate (string, required) - The end date in ISO format (YYYY-MM-DD)
 * @response 200 (ICalendarEvent[]) - The list of calendar events
 */
router.get(
  "/",
  validateYearMonth,
  validationMiddleware,
  EventsController.getEventsByDateRange,
);

router.get("/today", EventsController.getEventsToday);

/**
 * @protected
 * @summary Get a specific calendar event by ID
 * @description Retrieve a specific calendar event by its ID
 * @param id (string, required, must_exist) - The ID of the calendar event
 * @response 200 (ICalendarEvent) - The calendar event
 */
router.get(
  "/:id",
  validateId,
  validationMiddleware,
  EventsController.getEventById,
);

/**
 * @protected
 * @summary Create a new calendar event
 * @description Create a new calendar event with title, date, and optional description
 * @body title (string, required) - The title of the event
 * @body date (string, required) - The date of the event in ISO format
 * @body description (string, optional) - A description of the event
 * @response 201 (ICalendarEvent) - The created calendar event
 */
router.post(
  "/",
  validateEventData,
  validationMiddleware,
  EventsController.createEvent,
);

/**
 * @protected
 * @summary Update a calendar event
 * @description Update an existing calendar event with the given ID
 * @param id (string, required, must_exist) - The ID of the calendar event to update
 * @body title (string, required) - The title of the event
 * @body date (string, required) - The date of the event in ISO format
 * @body description (string, optional) - A description of the event
 * @response 200 (ICalendarEvent) - The updated calendar event
 */
router.patch(
  "/:id",
  validateId,
  validateEventData,
  validationMiddleware,
  EventsController.updateEvent,
);

/**
 * @protected
 * @summary Delete a calendar event
 * @description Delete an existing calendar event with the given ID
 * @param id (string, required, must_exist) - The ID of the calendar event to delete
 * @response 204 - The calendar event was deleted successfully
 */
router.delete(
  "/:id",
  validateId,
  validationMiddleware,
  EventsController.deleteEvent,
);

export default router;
