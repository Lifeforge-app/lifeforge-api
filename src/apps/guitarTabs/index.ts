import express from "express";

import entriesRoutes from "./routes/entries.routes";
import guitarWorldRoutes from "./routes/guitarWorld.routes";

const router = express.Router();

router.use("/entries", entriesRoutes);
router.use("/guitar-world", guitarWorldRoutes);

export default router;
