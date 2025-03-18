import express from "express";
import categoriesRoutes from "./routes/categories.routes";
import eventsRoutes from "./routes/events.routes";

const router = express.Router();

router.use("/events", eventsRoutes);
router.use("/categories", categoriesRoutes);

export default router;
