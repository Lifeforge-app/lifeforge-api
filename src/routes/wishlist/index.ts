import express from "express";
import listsRoutes from "./routes/lists.js";
import entriesRoutes from "./routes/entries.js";

const router = express.Router();

router.use("/lists", listsRoutes);
router.use("/entries", entriesRoutes);

export default router;
