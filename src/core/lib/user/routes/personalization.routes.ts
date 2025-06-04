import express from "express";

import { singleUploadMiddleware } from "../../../middlewares/uploadMiddleware";
import * as PersonalizationController from "../controllers/personalization.controller";

const router = express.Router();

router.get("/fonts", PersonalizationController.listGoogleFonts);

router.get("/font", PersonalizationController.getGoogleFont);

router.put(
  "/bg-image",
  singleUploadMiddleware,
  PersonalizationController.updateBgImage,
);

router.delete("/bg-image", PersonalizationController.deleteBgImage);

router.patch("/", PersonalizationController.updatePersonalization);

export default router;
