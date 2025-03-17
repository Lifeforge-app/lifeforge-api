import express from "express";
import validationMiddleware from "../../../middleware/validationMiddleware";
import * as TicketController from "../controllers/ticketController";
import { validateEntryId } from "../middlewares/entriesValidation";

const router = express.Router();

router.post("/ticket", TicketController.updateTicket);

router.patch(
  "/ticket/:id",
  validateEntryId,
  validationMiddleware,
  TicketController.updateTicket,
);

router.delete(
  "/ticket/:id",
  validateEntryId,
  validationMiddleware,
  TicketController.clearTicket,
);

export default router;
