import express from "express";
import entriesRoutes from "./routes/entries";
import ticketRoutes from "./routes/ticket";
import TMDBRoutes from "./routes/tmdb";

const router = express.Router();

router.use("/entries", entriesRoutes);
router.use("/entries/ticket", ticketRoutes);
router.use("/tmdb", TMDBRoutes);

export default router;
