import express from "express";
import validationMiddleware from "../../../core/middleware/validationMiddleware";
import * as LedgersController from "../controllers/ledgers.controller";
import { validateBodyData, validateId } from "../middlewares/ledgersValidation";

const router = express.Router();

/**
 * @protected
 * @summary Get a list of all wallet ledgers
 * @description Retrieve a list of all wallet ledgers.
 * @response 200
 */
router.get("/", LedgersController.getAllLedgers);

/**
 * @protected
 * @summary Create a new wallet ledger
 * @description Create a new wallet ledger with the given name, icon, and color.
 * @body name (string, required) - The name of the ledger
 * @body icon (string, required) - The icon of the ledger, can be any icon available in Iconify
 * @body color (string, required) - The color of the ledger, in hex format
 * @response 201 (IWalletLedger) - The created wallet ledger
 */
router.post(
  "/",
  validateBodyData,
  validationMiddleware,
  LedgersController.createLedger,
);

/**
 * @protected
 * @summary Update a wallet ledger
 * @description Update a wallet ledger with the given name, icon, and color.
 * @param id (string, required, must_exist) - The ID of the ledger
 * @body name (string, required) - The name of the ledger
 * @body icon (string, required) - The icon of the ledger, can be any icon available in Iconify
 * @body color (string, required) - The color of the ledger, in hex format
 * @response 200 (IWalletLedger) - The updated wallet ledger
 */
router.patch(
  "/:id",
  validateId,
  validateBodyData,
  validationMiddleware,
  LedgersController.updateLedger,
);

/**
 * @protected
 * @summary Delete a wallet ledger
 * @description Delete a wallet ledger with the given ID.
 * @param id (string, required, must_exist) - The ID of the ledger
 * @response 204 - The wallet ledger was successfully deleted
 */
router.delete(
  "/:id",
  validateId,
  validationMiddleware,
  LedgersController.deleteLedger,
);

export default router;
