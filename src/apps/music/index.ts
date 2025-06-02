import express from "express";

import entries from "./routes/entries";
import youtube from "./routes/youtube";

const router = express.Router();

router.use("/entries", entries);
router.use("/youtube", youtube);

export default router;
