import express from "express";

import entriesRoutes from "./routes/entries.routes";
import transcriptionRoutes from "./routes/transcription.routes";

const router = express.Router();

router.use("/entries", entriesRoutes);
router.use("/transcribe", transcriptionRoutes);

export default router;
