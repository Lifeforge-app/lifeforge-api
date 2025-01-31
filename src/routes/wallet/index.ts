import express from "express";
import transactionsRoutes from "./routes/transactions.js";
import categoryRoutes from "./routes/category.js";
import assetsRoutes from "./routes/assets.js";
import ledgersRoutes from "./routes/ledgers.js";
import { query } from "express-validator";
import hasError from "../../utils/checkError.js";
import asyncWrapper from "../../utils/asyncWrapper.js";
import { serverError, successWithBaseResponse } from "../../utils/response.js";

const router = express.Router();

router.use("/transactions", transactionsRoutes);
router.use("/categories", categoryRoutes);
router.use("/assets", assetsRoutes);
router.use("/ledgers", ledgersRoutes);

export default router;
