import express from "express";
import categoryRoutes from "./routes/categories";
import entriesRoutes from "./routes/entries";
import kanbanRoutes from "./routes/kanban";
import statusRoutes from "./routes/statuses";
import technologyRoutes from "./routes/technologies";
import visibilityRoutes from "./routes/visibilities";

const router = express.Router();

router.use("/entries", entriesRoutes);
router.use("/kanban", kanbanRoutes);
router.use("/categories", categoryRoutes);
router.use("/statuses", statusRoutes);
router.use("/visibilities", visibilityRoutes);
router.use("/technologies", technologyRoutes);

export default router;
