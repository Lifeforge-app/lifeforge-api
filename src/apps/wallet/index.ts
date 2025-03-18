import express from "express";
import assetsRoutes from "./routes/assets.routes";
import categoriesRoutes from "./routes/categories.routes";
import ledgersRoutes from "./routes/ledgers.routes";
import transactionsRoutes from "./routes/transactions.routes";

const router = express.Router();

router.use("/transactions", transactionsRoutes);
router.use("/categories", categoriesRoutes);
router.use("/assets", assetsRoutes);
router.use("/ledgers", ledgersRoutes);

export default router;
