import asyncWrapper from "@utils/asyncWrapper";
import express from "express";
import * as YoutubeController from "../controllers/youtube.controller";
import { validateYoutubeDownload } from "../middlewares/validation";

const router = express.Router();

router.get("/get-info/:id", asyncWrapper(YoutubeController.getVideoInfo));

router.post(
  "/async-download/:id",
  validateYoutubeDownload,
  asyncWrapper(YoutubeController.downloadVideo),
);

router.get(
  "/download-status",
  asyncWrapper(YoutubeController.getDownloadStatus),
);

export default router;
