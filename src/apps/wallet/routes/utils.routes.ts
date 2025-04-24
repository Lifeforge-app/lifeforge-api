import asyncWrapper from "@utils/asyncWrapper";
import express from "express";
import * as UtilsController from "../controllers/utils.controller";
import {
  validateGetExpensesBreakdown,
  validateGetIncomeExpensesSummary,
} from "../middlewares/utilsValidation";

const router = express.Router();

router.get("/types-count", asyncWrapper(UtilsController.getTypesCount));

router.get(
  "/income-expenses",
  validateGetIncomeExpensesSummary,
  asyncWrapper(UtilsController.getIncomeExpensesSummary),
);

router.get(
  "/expenses-breakdown",
  validateGetExpensesBreakdown,
  asyncWrapper(UtilsController.getExpensesBreakdown),
);

export default router;
