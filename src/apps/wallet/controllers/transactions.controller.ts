import { z } from "zod/v4";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import { zodHandler } from "@utils/asyncWrapper";

import * as TransactionsService from "../services/transactions.service";
import {
  WalletReceiptScanResultSchema,
  WalletTransactionEntrySchema,
} from "../typescript/wallet_interfaces";

export const getAllTransactions = zodHandler(
  {
    response: z.array(WithPBSchema(WalletTransactionEntrySchema)),
  },
  async ({ pb }) => await TransactionsService.getAllTransactions(pb),
);

export const createTransaction = zodHandler(
  {
    body: z.object({
      particulars: z.string(),
      date: z.string(),
      amount: z.string().transform((val) => parseFloat(val)),
      category: z.string().optional(),
      location: z.string().optional(),
      asset: z.string().optional(),
      ledger: z.string().optional(),
      type: z.enum(["income", "expenses", "transfer"]),
      fromAsset: z.string().optional(),
      toAsset: z.string().optional(),
    }),
    response: z.array(WithPBSchema(WalletTransactionEntrySchema)),
  },
  async ({ pb, body, req }) =>
    await TransactionsService.createTransaction(pb, body, req.file),
  {
    statusCode: 201,
    existenceCheck: {
      body: {
        category: "wallet_categories",
        asset: "[wallet_assets]",
        ledger: "[wallet_ledgers]",
        fromAsset: "[wallet_assets]",
        toAsset: "[wallet_assets]",
      },
    },
  },
);

export const updateTransaction = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    body: z.object({
      particulars: z.string(),
      date: z.string(),
      amount: z.string().transform((val) => parseFloat(val)),
      category: z.string().optional(),
      location: z.string().optional(),
      asset: z.string(),
      ledger: z.string().optional(),
      type: z.enum(["income", "expenses", "transfer"]),
      removeReceipt: z.boolean().optional(),
    }),
    response: WithPBSchema(WalletTransactionEntrySchema),
  },
  async ({ pb, params: { id }, body, req }) =>
    await TransactionsService.updateTransaction(
      pb,
      id,
      body,
      req.file,
      body.removeReceipt ?? false,
    ),
  {
    existenceCheck: {
      params: {
        id: "wallet_transactions",
      },
      body: {
        category: "wallet_categories",
        asset: "wallet_assets",
        ledger: "[wallet_ledgers]",
      },
    },
  },
);

export const deleteTransaction = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  },
  async ({ pb, params: { id } }) =>
    TransactionsService.deleteTransaction(pb, id),
  {
    statusCode: 204,
    existenceCheck: {
      params: {
        id: "wallet_transactions",
      },
    },
  },
);

export const scanReceipt = zodHandler(
  {
    response: WalletReceiptScanResultSchema,
  },
  async ({ pb, req }) => {
    if (!req.file) {
      throw new Error("No file uploaded");
    }

    return await TransactionsService.scanReceipt(pb, req.file);
  },
);
