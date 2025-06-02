import express from "express";

import calendarsRoutes from "./routes/calendars.routes";
import categoriesRoutes from "./routes/categories.routes";
import eventsRoutes from "./routes/events.routes";

const router = express.Router();

router.use("/events", eventsRoutes);
router.use("/calendars", calendarsRoutes);
router.use("/categories", categoriesRoutes);

export default router;
