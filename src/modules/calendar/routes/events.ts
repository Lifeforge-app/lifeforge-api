import express, { Request, Response } from "express";
import { successWithBaseResponse } from "../../../utils/response";
import asyncWrapper from "../../../utils/asyncWrapper";
import { body } from "express-validator";
import hasError from "../../../utils/checkError";
import { list } from "../../../utils/CRUD";
import { ICalendarEvent } from "../../../interfaces/calendar_interfaces";
import { BaseResponse } from "../../../interfaces/base_response";
import { checkExistence } from "../../../utils/PBRecordValidator";

const router = express.Router();

/**
 * @protected
 * @summary Get a list of all calendar events
 * @description Retrieve a list of all calendar events.
 * @response 200 (ICalendarEvent[]) - The list of calendar events
 */
router.get(
  "/",
  asyncWrapper(async (req, res: Response<BaseResponse<ICalendarEvent[]>>) =>
    list<ICalendarEvent>(req, res, "calendar_events")
  )
);

/**
 * @protected
 * @summary Create a new calendar event
 * @description Create a new calendar event with the given title, start, and end.
 * @body title (string, required) - The title of the event
 * @body start (string, required) - The start date and time of the event
 * @body end (string, required) - The end date and time of the event
 * @body category (string, optional, must_exist) - The category of the event
 * @response 201 (ICalendarEvent) - The created calendar event
 */
router.post(
  "/",
  [
    body("title").isString(),
    body("start").isString(),
    body("end").isString(),
    body("category").isString().optional(),
  ],
  asyncWrapper(async (req, res: Response<BaseResponse<ICalendarEvent>>) => {
    const { pb } = req;
    const { title, start, end, category } = req.body;

    if (!(await checkExistence(req, res, "calendar_categories", category))) {
      return;
    }

    const events: ICalendarEvent = await pb
      .collection("calendar_events")
      .create({
        title,
        start,
        end,
        category: category || "",
      });

    if (category) {
      await pb.collection("calendar_categories").update(category, {
        "amount+": 1,
      });
    }

    successWithBaseResponse(res, events);
  })
);

/**
 * @protected
 * @summary Update a calendar event
 * @description Update a calendar event with the given title, start, and end.
 * @param id (string, required, must_exist) - The ID of the event
 * @body title (string, required) - The title of the event
 * @body start (string, required) - The start date and time of the event
 * @body end (string, required) - The end date and time of the event
 * @body category (string, optional, must_exist) - The category of the event
 * @response 200 (ICalendarEvent) - The updated calendar event
 */
router.patch(
  "/:id",
  [
    body("title").isString(),
    body("start").isString(),
    body("end").isString(),
    body("category").isString().optional(),
  ],
  asyncWrapper(async (req, res: Response<BaseResponse<ICalendarEvent>>) => {
    const { pb } = req;
    const { id } = req.params;
    const { title, start, end, category } = req.body;

    const eventExists = await checkExistence(req, res, "calendar_events", id);

    const categoryExists = category
      ? await checkExistence(req, res, "calendar_categories", category)
      : true;

    if (!eventExists || !categoryExists) {
      return;
    }

    const oldEvent = await pb.collection("calendar_events").getOne(id);
    const events: ICalendarEvent = await pb
      .collection("calendar_events")
      .update(id, {
        title,
        start,
        end,
        category: category || "",
      });

    if (oldEvent.category !== category) {
      if (oldEvent.category) {
        await pb.collection("calendar_categories").update(oldEvent.category, {
          "amount-": 1,
        });
      }

      if (category) {
        await pb.collection("calendar_categories").update(category, {
          "amount+": 1,
        });
      }
    }

    successWithBaseResponse(res, events);
  })
);

/**
 * @protected
 * @summary Delete a calendar event
 * @description Delete a calendar event with the given ID.
 * @param id (string, required, must_exist) - The ID of the event
 * @response 200 - The calendar event was successfully deleted
 */
router.delete(
  "/:id",
  asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { id } = req.params;

    const event = await pb.collection("calendar_events").getOne(id);

    await pb.collection("calendar_events").delete(id);

    if (event.category) {
      await pb.collection("calendar_categories").update(event.category, {
        "amount-": 1,
      });
    }

    successWithBaseResponse(res);
  })
);

export default router;
