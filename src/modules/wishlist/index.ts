import express from "express";
import listsRoutes from "./routes/lists";
import entriesRoutes from "./routes/entries";

const router = express.Router();

router.use("/lists", listsRoutes);
router.use("/entries", entriesRoutes);

export default router;
