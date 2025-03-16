import express from "express";
import cardRoutes from "./routes/card.js";
import deckRoutes from "./routes/deck.js";
import tagRoutes from "./routes/tag.js";

const router = express.Router();

router.use("/tag", tagRoutes);
router.use("/deck", deckRoutes);
router.use("/card", cardRoutes);

export default router;
