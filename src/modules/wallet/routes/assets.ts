import express from "express";
import validationMiddleware from "../../../middleware/validationMiddleware";
import * as AssetsController from "../controllers/assetsController";
import { validateBodyData, validateId } from "../middlewares/assetsValidation";

const router = express.Router();

/**
 * @protected
 * @summary Get a list of all wallet assets
 * @description Retrieve a list of all wallet assets.
 * @response 200 (IWalletAsset[]) - The list of wallet assets
 */
router.get("/", AssetsController.getAllAssets);

/**
 * @protected
 * @summary Create a new wallet asset
 * @description Create a new wallet asset with the given name, icon, and starting balance.
 * @body name (string, required) - The name of the asset
 * @body icon (string, required) - The icon of the asset, can be any icon available in Iconify
 * @body starting_balance (number, required) - The starting balance of the asset
 * @response 201 (IWalletAsset) - The created wallet asset
 */
router.post(
  "/",
  validateBodyData,
  validationMiddleware,
  AssetsController.createAsset,
);

/**
 * @protected
 * @summary Update a wallet asset
 * @description Update an existing wallet asset with the given ID, setting the name, icon, and starting balance.
 * @param id (string, required, must_exist) - The ID of the wallet asset to update
 * @body name (string, required) - The name of the asset
 * @body icon (string, required) - The icon of the asset, can be any icon available in Iconify
 * @body starting_balance (number, required) - The starting balance of the asset
 * @response 200 (IWalletAsset) - The updated wallet asset
 */
router.patch(
  "/:id",
  validateId,
  validateBodyData,
  validationMiddleware,
  AssetsController.updateAsset,
);

/**
 * @protected
 * @summary Delete a wallet asset
 * @description Delete an existing wallet asset with the given ID.
 * @param id (string, required, must_exist) - The ID of the wallet asset to delete
 * @response 204 - The wallet asset was successfully deleted
 */
router.delete(
  "/:id",
  validateId,
  validationMiddleware,
  AssetsController.deleteAsset,
);

export default router;
