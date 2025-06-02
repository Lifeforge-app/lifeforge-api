import express from "express";

import asyncWrapper from "@utils/asyncWrapper";

import * as LedgersController from "../controllers/ledgers.controller";
import { validateBodyData, validateId } from "../middlewares/ledgersValidation";

const router = express.Router();

router.get("/", asyncWrapper(LedgersController.getAllLedgers));

router.post(
  "/",
  validateBodyData,
  asyncWrapper(LedgersController.createLedger),
);

router.patch(
  "/:id",
  validateId,
  validateBodyData,
  asyncWrapper(LedgersController.updateLedger),
);

router.delete("/:id", validateId, asyncWrapper(LedgersController.deleteLedger));

export default router;
