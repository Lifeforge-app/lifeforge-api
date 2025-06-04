import express from "express";

import * as YoutubeController from "../controllers/youtube.controller";

const router = express.Router();

router.get("/get-info/:id", YoutubeController.getVideoInfo);

router.post("/async-download/:id", YoutubeController.downloadVideo);

router.get("/download-status", YoutubeController.getDownloadStatus);

export default router;
