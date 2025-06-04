import express from "express";

import authRoutes from "./routes/auth.routes";
import entriesRoutes from "./routes/entries.routes";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/entries", entriesRoutes);

export default router;
