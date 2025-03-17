import express from "express";
import categoryRoutes from "./routes/categories.js";
import eventRoutes from "./routes/events.js";

const router = express.Router();

router.use("/events", eventRoutes);
router.use("/categories", categoryRoutes);

export default router;
