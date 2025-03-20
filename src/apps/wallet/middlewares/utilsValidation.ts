import { query } from "express-validator";

export const validateGetExpensesBreakdown = [
  query("year").isInt().toInt(),
  query("month").isInt().toInt(),
];

export const validateGetIncomeExpensesSummary = [
  query("year").isInt().toInt(),
  query("month").isInt().toInt(),
];
