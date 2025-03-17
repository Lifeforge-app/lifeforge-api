import express from "express";
import * as guitarWorldController from "../controllers/guitarWorld.controller";
import {
  validateDownloadTab,
  validateGetTabsList,
} from "../middleware/entriesValidation";

const router = express.Router();

router.post("/", validateGetTabsList, guitarWorldController.getTabsList);

router.post(
  "/download",
  validateDownloadTab,
  guitarWorldController.downloadTab,
);

export default router;
