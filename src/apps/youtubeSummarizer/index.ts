import express from "express";

import asyncWrapper from "@utils/asyncWrapper";

import * as YoutubeSummarizerController from "./controllers/youtubeSummarizer.controller";
import {
  validateURL,
  validateYoutubeID,
} from "./middleware/validationMiddleare";

const router = express.Router();

router.get(
  "/info/:id",
  validateYoutubeID,
  asyncWrapper(YoutubeSummarizerController.getYoutubeVideoInfo),
);

router.post(
  "/summarize",
  validateURL,
  asyncWrapper(YoutubeSummarizerController.summarizeVideo),
);

export default router;
