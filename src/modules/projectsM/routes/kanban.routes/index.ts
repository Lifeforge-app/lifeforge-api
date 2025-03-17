import express from "express";
import columnsRoutes from "./routes/columns.routes";

const router = express.Router();

router.use("/columns", columnsRoutes);

export default router;
