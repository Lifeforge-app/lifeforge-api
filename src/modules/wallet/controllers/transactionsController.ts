import { Request, Response } from "express";
import { BaseResponse } from "../../../interfaces/base_response";
import {
  IWalletIncomeExpensesSummary,
  IWalletReceiptScanResult,
  IWalletTransactionEntry,
} from "../../../interfaces/wallet_interfaces";
import * as TransactionsService from "../services/transactionsService";
import {
  clientError,
  serverError,
  successWithBaseResponse,
} from "../../../utils/response";
import { checkExistence } from "../../../utils/PBRecordValidator";
import { getAPIKey } from "../../../utils/getAPIKey";

export const getAllTransactions = async (
  req: Request,
  res: Response<BaseResponse<IWalletTransactionEntry[]>>
) => {
  const { pb } = req;

  const transactions = await TransactionsService.getAllTransactions(pb);

  if (!transactions) {
    serverError(res, "Failed to fetch transactions");
    return;
  }

  successWithBaseResponse(res, transactions);
};

export const getIncomeExpensesSummary = async (
  req: Request<{}, {}, {}, { year: string; month: string }>,
  res: Response<BaseResponse<IWalletIncomeExpensesSummary>>
) => {
  const { pb } = req;
  const { year, month } = req.query;

  const summary = await TransactionsService.getIncomeExpensesSummary(
    pb,
    year,
    month
  );

  if (!summary) {
    serverError(res, "Failed to fetch summary");
    return;
  }

  successWithBaseResponse(res, summary);
};

export const createTransaction = async (
  req: Request,
  res: Response<BaseResponse<IWalletTransactionEntry[]>>
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
    req.file
  );

  if (!transaction) {
    serverError(res, "Failed to create transaction");
    return;
  }

  successWithBaseResponse(res, transaction, 201);
};

export const updateTransaction = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<IWalletTransactionEntry>>
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
    removeReceipt
  );

  if (!transaction) {
    serverError(res, "Failed to update transaction");
    return;
  }

  successWithBaseResponse(res, transaction);
};

export const deleteTransaction = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<null>>
) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "wallet_transactions", id))) return;

  const isDeleted = await TransactionsService.deleteTransaction(pb, id);

  if (!isDeleted) {
    serverError(res, "Failed to delete transaction");
    return;
  }

  successWithBaseResponse(res, undefined, 204);
};

export const scanReceipt = async (
  req: Request,
  res: Response<BaseResponse<IWalletReceiptScanResult>>
) => {
  const { file } = req;

  if (!file) {
    clientError(res, "No file uploaded");
    return;
  }

  const key = await getAPIKey("openai", req.pb);

  if (!key) {
    serverError(res, "API key not found");
    return;
  }

  const result = await TransactionsService.scanReceipt(file, key);

  if (!result) {
    serverError(res, "Error scanning receipt");
    return;
  }

  successWithBaseResponse(res, result);
};
