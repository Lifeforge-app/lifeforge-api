import express from "express";

import * as TicketController from "../controllers/ticket.controller";

const router = express.Router();

router.post("/", TicketController.updateTicket);

router.patch("/:id", TicketController.updateTicket);

router.delete("/:id", TicketController.clearTicket);

export default router;
