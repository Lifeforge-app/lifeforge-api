import express from "express";
import transactionsRoutes from "./transactions";
import categoryRoutes from "./category";
import assetsRoutes from "./assets";
import ledgersRoutes from "./ledgers";

const router = express.Router();

router.use("/transactions", transactionsRoutes);
router.use("/categories", categoryRoutes);
router.use("/assets", assetsRoutes);
router.use("/ledgers", ledgersRoutes);

export default router;
