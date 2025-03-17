import { Request, Response } from "express";
import { BaseResponse } from "../../../interfaces/base_response";
import {
  IWalletIncomeExpensesSummary,
  IWalletReceiptScanResult,
  IWalletTransactionEntry,
} from "../../../interfaces/wallet_interfaces";
import { checkExistence } from "../../../utils/PBRecordValidator";
import {
  clientError,
  serverError,
  successWithBaseResponse,
} from "../../../utils/response";
import * as TransactionsService from "../services/transactionsService";

export const getAllTransactions = async (
  req: Request,
  res: Response<BaseResponse<IWalletTransactionEntry[]>>,
) => {
  const { pb } = req;

  try {
    const transactions = await TransactionsService.getAllTransactions(pb);
    successWithBaseResponse(res, transactions);
  } catch (error) {
    serverError(res, "Failed to fetch transactions");
  }
};

export const getIncomeExpensesSummary = async (
  req: Request<{}, {}, {}, { year: string; month: string }>,
  res: Response<BaseResponse<IWalletIncomeExpensesSummary>>,
) => {
  const { pb } = req;
  const { year, month } = req.query;

  try {
    const summary = await TransactionsService.getIncomeExpensesSummary(
      pb,
      year,
      month,
    );
    successWithBaseResponse(res, summary);
  } catch (error) {
    serverError(res, "Failed to fetch summary");
  }
};

export const createTransaction = async (
  req: Request,
  res: Response<BaseResponse<IWalletTransactionEntry[]>>,
) => {
  const { pb } = req;
  let {
    particulars,
    date,
    amount,
    category,
    location,
    asset,
    ledger,
    type,
    fromAsset,
    toAsset,
  } = req.body;

  if (
    category &&
    !(await checkExistence(req, res, "wallet_categories", category))
  ) {
    return;
  }

  if (
    ["income", "expenses"].includes(type) &&
    !(await checkExistence(req, res, "wallet_assets", asset))
  ) {
    return;
  }

  if (ledger && !(await checkExistence(req, res, "wallet_ledgers", ledger))) {
    return;
  }

  if (type === "transfer") {
    if (!(await checkExistence(req, res, "wallet_assets", fromAsset))) {
      return;
    }

    if (!(await checkExistence(req, res, "wallet_assets", toAsset))) {
      return;
    }
  }

  try {
    const transaction = await TransactionsService.createTransaction(
      pb,
      {
        particulars,
        date,
        amount,
        category,
        location,
        asset,
        ledger,
        type,
        fromAsset,
        toAsset,
      },
      req.file,
    );
    successWithBaseResponse(res, transaction, 201);
  } catch (error) {
    serverError(res, "Failed to create transaction");
  }
};

export const updateTransaction = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<IWalletTransactionEntry>>,
) => {
  const { pb } = req;
  const { id } = req.params;
  let {
    particulars,
    date,
    amount,
    category,
    location,
    asset,
    ledger,
    type,
    removeReceipt,
  } = req.body;

  if (
    category &&
    !(await checkExistence(req, res, "wallet_categories", category))
  ) {
    return;
  }

  if (!(await checkExistence(req, res, "wallet_assets", asset))) {
    return;
  }

  if (ledger && !(await checkExistence(req, res, "wallet_ledgers", ledger))) {
    return;
  }

  if (!(await checkExistence(req, res, "wallet_transactions", id))) {
    return;
  }

  try {
    const transaction = await TransactionsService.updateTransaction(
      pb,
      id,
      {
        particulars,
        date,
        amount,
        location,
        category,
        asset,
        ledger,
        type,
      },
      req.file,
      removeReceipt,
    );
    successWithBaseResponse(res, transaction);
  } catch (error) {
    serverError(res, "Failed to update transaction");
  }
};

export const deleteTransaction = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<null>>,
) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "wallet_transactions", id))) {
    return;
  }

  try {
    const isDeleted = await TransactionsService.deleteTransaction(pb, id);

    if (isDeleted) {
      successWithBaseResponse(res, undefined, 204);
    } else {
      serverError(res, "Failed to delete transaction");
    }
  } catch (error) {
    serverError(res, "Failed to delete transaction");
  }
};

export const scanReceipt = async (
  req: Request,
  res: Response<BaseResponse<IWalletReceiptScanResult>>,
) => {
  const { file } = req;

  if (!file) {
    clientError(res, "No file uploaded");
    return;
  }

  try {
    const result = await TransactionsService.scanReceipt(req.pb, file);
    successWithBaseResponse(res, result);
  } catch (error) {
    serverError(res, "Error scanning receipt");
  }
};
