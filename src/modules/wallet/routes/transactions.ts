import express from "express";
import { singleUploadMiddleware } from "../../../middleware/uploadMiddleware";
import * as TransactionsController from "../controllers/transactionsController";
import {
  validateBodyDataForCreation,
  validateBodyDataForUpdate,
  validateId,
  validateYearAndMonth,
} from "../middlewares/transactionsValidation";
import validationMiddleware from "../../../middleware/validationMiddleware";

const router = express.Router();

/**
 * @protected
 * @summary Get a list of all wallet transactions
 * @description Retrieve a list of all wallet transactions.
 * @response 200 (IWalletTransactionEntry[]) - The list of wallet transactions
 */
router.get("/", TransactionsController.getAllTransactions);

/**
 * @protected
 * @summary Get the summarized amount of income and expenses
 * @description Retrieve the total amount of income and expenses, as well as the amount of income and expenses in a specific month.
 * @query year (number, required) - The year to filter by (YYYY)
 * @query month (number, required) - The month to filter by (M)
 * @response 200 (IWalletIncomeExpenses) - The total and monthly income and expenses
 */
router.get(
  "/income-expenses",
  validateYearAndMonth,
  validationMiddleware,
  TransactionsController.getIncomeExpensesSummary
);

/**
 * @protected
 * @summary Create a new wallet transaction
 * @description Create a new wallet transaction with the given particulars, date, amount, category, asset, ledger, type, and side.
 * @body type (string, required, one_of income|expenses|transfer) - The type of the transaction
 * @body particulars (string, required) - The particulars of the transaction
 * @body date (string, required) - The date of the transaction (any valid date string that can be parsed by moment.js)
 * @body amount (number, required) - The amount of the transaction
 * @body location (string, optional) - The location where the transaction took place
 * @body category (string, optional, must_exist) - The ID of the category, will raise an error if the type is transfer
 * @body asset (string, required if type is not transfer, must_exist) - The ID of the asset, will raise an error if the type is transfer
 * @body ledger (string, optional) - The ID of the ledger, will raise an error if the type is transfer
 * @body fromAsset (string, required if type is transfer, must_exist) - The ID of the asset to transfer from
 * @body toAsset (string, required if type is transfer, must_exist) - The ID of the asset to transfer to
 * @response 201 (IWalletTransactionEntry[]) - The created wallet transaction
 */
router.post(
  "/",
  singleUploadMiddleware,
  validateBodyDataForCreation,
  validationMiddleware,
  TransactionsController.createTransaction
);

/**
 * @protected
 * @summary Update a wallet transaction
 * @description Update a wallet income or expenses transaction with the given particulars, date, amount, category, asset, ledger, type, and side.
 * @param id (string, required, must_exist) - The ID of the transaction
 * @body particulars (string, required) - The particulars of the transaction
 * @body date (string, required) - The date of the transaction (any valid date string that can be parsed by moment.js)
 * @body amount (number, required) - The amount of the transaction
 * @body location (string, optional) - The location where the transaction took place
 * @body category (string, optional, must_exist) - The ID of the category
 * @body asset (string, optional, must_exist) - The ID of the asset
 * @body ledger (string, optional, must_exist) - The ID of the ledger
 * @body type (string, required, one_of income|expenses) - The type of the transaction
 * @response 200 (IWalletTransactionEntry) - The updated wallet transaction
 */
router.patch(
  "/:id",
  singleUploadMiddleware,
  validateBodyDataForUpdate,
  validateId,
  validationMiddleware,
  TransactionsController.updateTransaction
);

/**
 * @protected
 * @summary Delete a wallet transaction
 * @description Delete a wallet transaction with the given ID.
 * @param id (string, required, must_exist) - The ID of the transaction
 * @response 204 - The wallet transaction was successfully deleted
 */
router.delete(
  "/:id",
  validateId,
  validationMiddleware,
  TransactionsController.deleteTransaction
);

router.post(
  "/scan-receipt",
  singleUploadMiddleware,
  TransactionsController.scanReceipt
);

export default router;
