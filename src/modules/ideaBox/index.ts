import express from "express";

import containersRoutes from "./routes/containers.routes";
import foldersRoutes from "./routes/folders.routes";
import ideasRoutes from "./routes/ideas.routes";
import miscRoutes from "./routes/misc.routes";
import tagsRoutes from "./routes/tags.routes";

const router = express.Router();

router.use("/containers", containersRoutes);
router.use("/folders", foldersRoutes);
router.use("/ideas", ideasRoutes);
router.use("/tags", tagsRoutes);
router.use("/", miscRoutes);

export default router;
