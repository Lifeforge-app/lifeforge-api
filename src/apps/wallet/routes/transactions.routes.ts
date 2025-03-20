import express from "express";
import { singleUploadMiddleware } from "../../../core/middleware/uploadMiddleware";
import asyncWrapper from "../../../core/utils/asyncWrapper";
import * as TransactionsController from "../controllers/transactions.controller";
import {
  validateBodyDataForCreation,
  validateBodyDataForUpdate,
  validateId,
} from "../middlewares/transactionsValidation";

const router = express.Router();

router.get("/", asyncWrapper(TransactionsController.getAllTransactions));

router.post(
  "/",
  singleUploadMiddleware,
  validateBodyDataForCreation,
  asyncWrapper(TransactionsController.createTransaction),
);

router.patch(
  "/:id",
  singleUploadMiddleware,
  validateBodyDataForUpdate,
  validateId,
  asyncWrapper(TransactionsController.updateTransaction),
);

router.delete(
  "/:id",
  validateId,
  asyncWrapper(TransactionsController.deleteTransaction),
);

router.post(
  "/scan-receipt",
  singleUploadMiddleware,
  asyncWrapper(TransactionsController.scanReceipt),
);

export default router;
