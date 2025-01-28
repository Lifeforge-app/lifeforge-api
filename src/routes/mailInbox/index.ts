import express from "express";
import entriesRoutes from "./routes/entries.js";
import labelsRoutes from "./routes/labels.js";

const router = express.Router();

router.use("/entries", entriesRoutes);
router.use("/labels", labelsRoutes);

export default router;
