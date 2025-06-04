import express from "express";

import { singleUploadMiddleware } from "@middlewares/uploadMiddleware";

import * as TranscriptionController from "../controllers/transcription.controller";

const router = express.Router();

router.post("/:id", TranscriptionController.transcribeExisted);

router.post("/", singleUploadMiddleware, TranscriptionController.transcribeNew);

export default router;
