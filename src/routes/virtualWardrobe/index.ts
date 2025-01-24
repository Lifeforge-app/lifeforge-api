import express from "express";
import entriesRoutes from "./routes/entries.js";
import sessionRoutes from "./routes/session.js";

const router = express.Router();

router.use("/entries", entriesRoutes);
router.use("/session", sessionRoutes);

export default router;
