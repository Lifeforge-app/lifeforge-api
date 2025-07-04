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
  location_name: z.string(),
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

const WalletIncomeExpensesSchema = z.object({
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

type IWalletAsset = z.infer<typeof WalletAssetSchema>;
type IWalletLedger = z.infer<typeof WalletLedgerSchema>;
type IWalletTransactionEntry = z.infer<typeof WalletTransactionEntrySchema>;
type IWalletCategory = z.infer<typeof WalletCategorySchema>;
type IWalletIncomeExpenses = z.infer<typeof WalletIncomeExpensesSchema>;
type IWalletReceiptScanResult = z.infer<typeof WalletReceiptScanResultSchema>;

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
  IWalletIncomeExpenses,
  IWalletLedger,
  IWalletReceiptScanResult,
  IWalletTransactionEntry,
};
