import express from "express";
import entriesRoutes from "./routes/entries.routes";
import ticketRoutes from "./routes/ticket.routes";
import TMDBRoutes from "./routes/tmdb.routes";

const router = express.Router();

router.use("/entries/ticket", ticketRoutes);
router.use("/entries", entriesRoutes);
router.use("/tmdb", TMDBRoutes);

export default router;
