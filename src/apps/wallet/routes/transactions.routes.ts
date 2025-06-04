import express from "express";

import { singleUploadMiddleware } from "@middlewares/uploadMiddleware";

import * as TransactionsController from "../controllers/transactions.controller";

const router = express.Router();

router.get("/", TransactionsController.getAllTransactions);

router.post(
  "/",
  singleUploadMiddleware,
  TransactionsController.createTransaction,
);

router.patch(
  "/:id",
  singleUploadMiddleware,
  TransactionsController.updateTransaction,
);

router.delete("/:id", TransactionsController.deleteTransaction);

router.post(
  "/scan-receipt",
  singleUploadMiddleware,
  TransactionsController.scanReceipt,
);

export default router;
