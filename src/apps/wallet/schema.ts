import { z } from "zod/v4";

const WalletAssetSchema = z.object({
  name: z.string(),
  icon: z.string(),
  balance: z.number().optional(),
  starting_balance: z.number(),
  amount: z.number(),
});

const WalletLedgerSchema = z.object({
  name: z.string(),
  icon: z.string(),
  color: z.string(),
  amount: z.number(),
});

const WalletTransactionEntrySchema = z.object({
  type: z.enum(["income", "expenses", "transfer"]),
  side: z.enum(["debit", "credit"]),
  particulars: z.string(),
  amount: z.number(),
  location_name: z.string().optional(),
  location_coords: z.object({
    lon: z.number(),
    lat: z.number(),
  }),
  date: z.string(),
  category: z.string(),
  asset: z.string(),
  ledger: z.string(),
  receipt: z.string(),
  fromAsset: z.string().optional(),
  toAsset: z.string().optional(),
});

const WalletCategorySchema = z.object({
  name: z.string(),
  icon: z.string(),
  color: z.string(),
  amount: z.number(),
  type: z.enum(["income", "expenses"]),
});

const WalletIncomeExpensesSummarySchema = z.object({
  totalIncome: z.number(),
  totalExpenses: z.number(),
  monthlyIncome: z.number(),
  monthlyExpenses: z.number(),
});

const WalletReceiptScanResultSchema = z.object({
  date: z.string(),
  particulars: z.string(),
  type: z.string(),
  amount: z.number(),
});

const WalletTransactionTypeSchema = z.object({
  name: z.string(),
  amount: z.number(),
  accumulate: z.number(),
});

type IWalletAsset = z.infer<typeof WalletAssetSchema>;
type IWalletLedger = z.infer<typeof WalletLedgerSchema>;
type IWalletTransactionEntry = z.infer<typeof WalletTransactionEntrySchema>;
type IWalletCategory = z.infer<typeof WalletCategorySchema>;
type IWalletIncomeExpensesSummary = z.infer<
  typeof WalletIncomeExpensesSummarySchema
>;
type IWalletReceiptScanResult = z.infer<typeof WalletReceiptScanResultSchema>;
type IWalletTransactionType = z.infer<typeof WalletTransactionTypeSchema>;

export {
  WalletAssetSchema,
  WalletCategorySchema,
  WalletIncomeExpensesSummarySchema,
  WalletLedgerSchema,
  WalletReceiptScanResultSchema,
  WalletTransactionEntrySchema,
  WalletTransactionTypeSchema,
};

export type {
  IWalletAsset,
  IWalletCategory,
  IWalletIncomeExpensesSummary,
  IWalletLedger,
  IWalletReceiptScanResult,
  IWalletTransactionEntry,
  IWalletTransactionType,
};
