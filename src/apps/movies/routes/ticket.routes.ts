import express from "express";
import asyncWrapper from "../../../core/utils/asyncWrapper";
import * as TicketController from "../controllers/ticket.controller";

const router = express.Router();

router.post("/", asyncWrapper(TicketController.updateTicket));

router.post("/calendar/:id", asyncWrapper(TicketController.addToCalendar));

router.patch("/:id", asyncWrapper(TicketController.updateTicket));

router.delete("/:id", asyncWrapper(TicketController.clearTicket));

export default router;
