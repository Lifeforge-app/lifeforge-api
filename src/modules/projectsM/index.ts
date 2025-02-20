import express, { Request, Response } from "express";
import entriesRoutes from "./routes/entries";
import kanbanRoutes from "./routes/kanban";
import categoryRoutes from "./routes/categories";
import statusRoutes from "./routes/statuses";
import visibilityRoutes from "./routes/visibilities";
import technologyRoutes from "./routes/technologies";

const router = express.Router();

router.use("/entries", entriesRoutes);
router.use("/kanban", kanbanRoutes);
router.use("/categories", categoryRoutes);
router.use("/statuses", statusRoutes);
router.use("/visibilities", visibilityRoutes);
router.use("/technologies", technologyRoutes);

export default router;
