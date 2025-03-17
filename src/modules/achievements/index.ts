import express from "express";
import entriesRoutes from "./routes/entries.routes";

const router = express.Router();

router.use("/entries", entriesRoutes);

export default router;
