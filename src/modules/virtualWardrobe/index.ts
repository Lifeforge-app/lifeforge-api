import express from "express";
import entriesRoutes from "./routes/entries";
import sessionRoutes from "./routes/session";

const router = express.Router();

router.use("/entries", entriesRoutes);
router.use("/session", sessionRoutes);

export default router;
