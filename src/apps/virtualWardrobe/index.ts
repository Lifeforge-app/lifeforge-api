import express from "express";

import entriesRoutes from "./routes/entries.routes";
import sessionRoutes from "./routes/session.routes";

const router = express.Router();

router.use("/entries", entriesRoutes);
router.use("/session", sessionRoutes);

export default router;
