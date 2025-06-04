import express from "express";

import * as ImageGenerationController from "../controllers/imageGeneration.controller";

const router = express.Router();

router.get("/key-exists", ImageGenerationController.checkKey);

router.post("/generate-image", ImageGenerationController.generateImage);

export default router;
