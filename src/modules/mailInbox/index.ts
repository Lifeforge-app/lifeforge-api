import express from "express";
import entriesRoutes from "./routes/entries";
import labelsRoutes from "./routes/labels";

const router = express.Router();

router.use("/entries", entriesRoutes);
router.use("/labels", labelsRoutes);

export default router;
