import express from "express";

import entriesRoutes from "./routes/entries.routes";
import listsRoutes from "./routes/lists.routes";

const router = express.Router();

router.use("/lists", listsRoutes);
router.use("/entries", entriesRoutes);

export default router;
