import asyncWrapper from "@utils/asyncWrapper";
import express from "express";
import * as YoutubeSummarizerController from "./controllers/youtubeSummarizer.controller";
import { validateYoutubeID } from "./middleware/validationMiddleare";

const router = express.Router();

router.get(
  "/info/:id",
  validateYoutubeID,
  asyncWrapper(YoutubeSummarizerController.getYoutubeVideoInfo),
);

export default router;
