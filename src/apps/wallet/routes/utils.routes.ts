import express from "express";

import * as UtilsController from "../controllers/utils.controller";

const router = express.Router();

router.get("/types-count", UtilsController.getTypesCount);

router.get("/income-expenses", UtilsController.getIncomeExpensesSummary);

router.get("/expenses-breakdown", UtilsController.getExpensesBreakdown);

export default router;
