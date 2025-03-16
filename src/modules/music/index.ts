import express from "express";
import entries from "./routes/entries.js";
import youtube from "./routes/youtube.js";

const router = express.Router();

router.use("/entries", entries);
router.use("/youtube", youtube);

export default router;
