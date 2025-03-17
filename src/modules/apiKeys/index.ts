import express from "express";
import { v4 } from "uuid";
import authRoutes from "./routes/auth.routes";
import entriesRoutes from "./routes/entries.routes";

const router = express.Router();

export let challenge = v4();

setTimeout(() => {
  challenge = v4();
}, 1000 * 60);

router.use("/auth", authRoutes);
router.use("/entries", entriesRoutes);

export default router;
