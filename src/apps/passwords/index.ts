import express from "express";

import entries from "./routes/entries.js";
import master from "./routes/master.js";

const router = express.Router();

router.use("/master", master);
router.use("/entries", entries);

export default router;
