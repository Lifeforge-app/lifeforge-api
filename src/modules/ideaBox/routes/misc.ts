import express from "express";
import validationMiddleware from "../../../middleware/validationMiddleware";
import * as miscController from "../controllers/miscController";
import {
  validateCheckValid,
  validateGetOgData,
  validateGetPath,
  validateSearch,
} from "../middleware/miscValidation";

const router = express.Router();

router.get(
  "/path/:container/*",
  validateGetPath,
  validationMiddleware,
  miscController.getPath,
);

/**
 * @protected
 * @summary Check if an idea box folder exists
 * @description Check if an idea box folder exists by its ID.
 * @param id (string, required) - The ID of the idea box folder
 * @response 200 (boolean) - Whether the idea box folder exists
 */
router.get(
  "/valid/:container/*",
  validateCheckValid,
  validationMiddleware,
  miscController.checkValid,
);

router.get(
  "/og-data/:id",
  validateGetOgData,
  validationMiddleware,
  miscController.getOgData,
);

router.get(
  "/search",
  validateSearch,
  validationMiddleware,
  miscController.search,
);

export default router;
