import express from "express";
import imageGenerationRoutes from "./routes/imageGeneration.routes";

const router = express.Router();

router.use("/image-generation", imageGenerationRoutes);

export default router;
