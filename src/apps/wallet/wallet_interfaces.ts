import * as s from "superstruct";

import { BasePBCollectionSchema } from "@typescript/pocketbase_interfaces";

const WalletAssetSchema = s.assign(
  BasePBCollectionSchema,
  s.object({
    name: s.string(),
    icon: s.string(),
    balance: s.optional(s.number()),
    starting_balance: s.number(),
    amount: s.number(),
  }),
);

const WalletLedgerSchema = s.assign(
  BasePBCollectionSchema,
  s.object({
    name: s.string(),
    icon: s.string(),
    color: s.string(),
    amount: s.number(),
  }),
);

const WalletTransactionEntrySchema = s.assign(
  BasePBCollectionSchema,
  s.object({
    type: s.union([
      s.literal("income"),
      s.literal("expenses"),
      s.literal("transfer"),
    ]),
    side: s.union([s.literal("debit"), s.literal("credit")]),
    particulars: s.string(),
    amount: s.number(),
    location: s.optional(s.string()),
    date: s.string(),
    category: s.string(),
    asset: s.string(),
    ledger: s.string(),
    receipt: s.string(),
    fromAsset: s.optional(s.string()),
    toAsset: s.optional(s.string()),
  }),
);

const WalletCategorySchema = s.assign(
  WalletLedgerSchema,
  s.object({
    type: s.union([s.literal("income"), s.literal("expenses")]),
  }),
);

const WalletIncomeExpensesSchema = s.object({
  totalIncome: s.number(),
  totalExpenses: s.number(),
  monthlyIncome: s.number(),
  monthlyExpenses: s.number(),
});

const WalletReceiptScanResultSchema = s.object({
  date: s.string(),
  particulars: s.string(),
  type: s.string(),
  amount: s.number(),
});

type IWalletAsset = s.Infer<typeof WalletAssetSchema>;
type IWalletLedger = s.Infer<typeof WalletLedgerSchema>;
type IWalletTransactionEntry = s.Infer<typeof WalletTransactionEntrySchema>;
type IWalletCategory = s.Infer<typeof WalletCategorySchema>;
type IWalletIncomeExpenses = s.Infer<typeof WalletIncomeExpensesSchema>;
type IWalletReceiptScanResult = s.Infer<typeof WalletReceiptScanResultSchema>;

export {
  WalletAssetSchema,
  WalletCategorySchema,
  WalletIncomeExpensesSchema,
  WalletLedgerSchema,
  WalletReceiptScanResultSchema,
  WalletTransactionEntrySchema,
};

export type {
  IWalletAsset,
  IWalletCategory,
  IWalletIncomeExpenses as IWalletIncomeExpensesSummary,
  IWalletLedger,
  IWalletReceiptScanResult,
  IWalletTransactionEntry,
};
