import express from "express";
import entriesRoutes from "./routes/entries.js";
import guitarWorldRoutes from "./routes/guitarWorld.js";

const router = express.Router();

router.use("/entries", entriesRoutes);
router.use("/guitar-world", guitarWorldRoutes);

export default router;
