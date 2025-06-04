import express from "express";
import OpenAI from "openai";
import { z } from "zod";

import ClientError from "@utils/ClientError";
import { zodHandler } from "@utils/asyncWrapper";
import { getAPIKey } from "@utils/getAPIKey";

import * as ImageGenerationController from "../controllers/imageGeneration.controller";

const router = express.Router();

router.get("/key-exists", ImageGenerationController.checkKey);

router.post("/generate-image", ImageGenerationController.generateImage);

export default router;
