import express from "express";

import containersRoutes from "./routes/containers";
import foldersRoutes from "./routes/folders";
import ideasRoutes from "./routes/ideas";
import miscRoutes from "./routes/misc";
import tagsRoutes from "./routes/tags";

const router = express.Router();

router.use("/containers", containersRoutes);
router.use("/folders", foldersRoutes);
router.use("/ideas", ideasRoutes);
router.use("/tags", tagsRoutes);
router.use("/", miscRoutes);

export default router;
