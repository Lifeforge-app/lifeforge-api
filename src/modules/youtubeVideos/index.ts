import express from "express";
import playlistRoutes from "./routes/playlist.js";
import videoRoutes from "./routes/video.js";

const router = express.Router();

router.use("/video", videoRoutes);
router.use("/playlist", playlistRoutes);

export default router;
