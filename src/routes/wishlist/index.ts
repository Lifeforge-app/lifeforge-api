import express from "express";
import listsRoutes from "./routes/lists.js";

const router = express.Router();

router.use("/lists", listsRoutes);

export default router;
