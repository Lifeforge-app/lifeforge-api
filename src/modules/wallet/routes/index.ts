import express from "express";
import assetsRoutes from "./assets";
import categoryRoutes from "./category";
import ledgersRoutes from "./ledgers";
import transactionsRoutes from "./transactions";

const router = express.Router();

router.use("/transactions", transactionsRoutes);
router.use("/categories", categoryRoutes);
router.use("/assets", assetsRoutes);
router.use("/ledgers", ledgersRoutes);

export default router;
