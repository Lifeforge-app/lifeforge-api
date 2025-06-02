import express from "express";

import entriesRoutes from "./routes/entries.routes";
import listsRoutes from "./routes/lists.routes";
import prioritiesRoutes from "./routes/priorities.routes";
import subtasksRoutes from "./routes/subtasks.routes";
import tagsRoutes from "./routes/tags.routes";

const router = express.Router();

router.use("/entries", entriesRoutes);
router.use("/subtasks", subtasksRoutes);
router.use("/priorities", prioritiesRoutes);
router.use("/lists", listsRoutes);
router.use("/tags", tagsRoutes);

export default router;
