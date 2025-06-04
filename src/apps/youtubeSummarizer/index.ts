import express from "express";

import * as YoutubeSummarizerController from "./controllers/youtubeSummarizer.controller";

const router = express.Router();

router.get("/info/:id", YoutubeSummarizerController.getYoutubeVideoInfo);

router.post("/summarize", YoutubeSummarizerController.summarizeVideo);

export default router;
