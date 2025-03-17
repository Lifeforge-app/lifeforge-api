import express from "express";
import assetsRoutes from "./routes/assets";
import categoriesRoutes from "./routes/categories";
import ledgersRoutes from "./routes/ledgers";
import transactionsRoutes from "./routes/transactions";

const router = express.Router();

router.use("/transactions", transactionsRoutes);
router.use("/categories", categoriesRoutes);
router.use("/assets", assetsRoutes);
router.use("/ledgers", ledgersRoutes);

export default router;
