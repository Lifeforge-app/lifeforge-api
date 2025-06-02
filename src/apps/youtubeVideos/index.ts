import express from "express";

import playlistRoutes from "./routes/playlist.routes";
import videoRoutes from "./routes/video.routes";

const router = express.Router();

router.use("/video", videoRoutes);
router.use("/playlist", playlistRoutes);

export default router;
