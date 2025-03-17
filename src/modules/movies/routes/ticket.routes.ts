import express from "express";
import asyncWrapper from "../../../core/utils/asyncWrapper";
import * as TicketController from "../controllers/ticket.controller";
import { validateEntryId } from "../middlewares/entriesValidation";

const router = express.Router();

router.post("/", asyncWrapper(TicketController.updateTicket));

router.patch(
  "/:id",
  validateEntryId,
  asyncWrapper(TicketController.updateTicket),
);

router.delete(
  "/:id",
  validateEntryId,
  asyncWrapper(TicketController.clearTicket),
);

export default router;
