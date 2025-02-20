import express from "express";
import entriesRoutes from "./routes/entries";
import guitarWorldRoutes from "./routes/guitarWorld";

const router = express.Router();

router.use("/entries", entriesRoutes);
router.use("/guitar-world", guitarWorldRoutes);

export default router;
