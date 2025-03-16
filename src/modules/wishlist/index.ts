import express from "express";
import entriesRoutes from "./routes/entries";
import listsRoutes from "./routes/lists";

const router = express.Router();

router.use("/lists", listsRoutes);
router.use("/entries", entriesRoutes);

export default router;
