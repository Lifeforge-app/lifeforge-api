import express from "express";
import entriesRoutes from "./entries";

const router = express.Router();

router.use("/entries", entriesRoutes);

export default router;
