import express from "express";

import * as LedgersController from "../controllers/ledgers.controller";

const router = express.Router();

router.get("/", LedgersController.getAllLedgers);

router.post("/", LedgersController.createLedger);

router.patch("/:id", LedgersController.updateLedger);

router.delete("/:id", LedgersController.deleteLedger);

export default router;
