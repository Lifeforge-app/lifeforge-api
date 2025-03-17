import express from "express";
import validationMiddleware from "../../../core/middleware/validationMiddleware";
import * as TicketController from "../controllers/ticket.controller";
import { validateEntryId } from "../middlewares/entriesValidation";

const router = express.Router();

router.post("/", TicketController.updateTicket);

router.patch(
  "/:id",
  validateEntryId,
  validationMiddleware,
  TicketController.updateTicket,
);

router.delete(
  "/:id",
  validateEntryId,
  validationMiddleware,
  TicketController.clearTicket,
);

export default router;
