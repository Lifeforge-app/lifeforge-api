// This file is auto-generated. DO NOT EDIT IT MANUALLY.
// Generated for module: wallet
// Generated at: 2025-07-09T11:52:26.854Z
// Contains: wallet__assets, wallet__ledgers, wallet__categories, wallet__transactions, wallet__categories_aggregated, wallet__assets_aggregated, wallet__ledgers_aggregated, wallet__transaction_types_aggregated
import { z } from "zod/v4";

const WalletAssetsSchema = z.object({
  name: z.string(),
  icon: z.string(),
  starting_balance: z.number(),
});

const WalletLedgersSchema = z.object({
  name: z.string(),
  icon: z.string(),
  color: z.string(),
});

const WalletCategoriesSchema = z.object({
  name: z.string(),
  icon: z.string(),
  color: z.string(),
  type: z.enum(["income", "expenses"]),
});

const WalletTransactionsSchema = z.object({
  type: z.enum(["income", "expenses", "transfer"]),
  side: z.enum(["debit", "credit"]),
  particulars: z.string(),
  amount: z.number(),
  date: z.string(),
  location_name: z.string(),
  location_coords: z.object({ lat: z.number(), lon: z.number() }),
  category: z.string(),
  asset: z.string(),
  ledger: z.string(),
  receipt: z.string(),
});

const WalletCategoriesAggregatedSchema = z.object({
  type: z.enum(["income", "expenses"]),
  name: z.string(),
  icon: z.string(),
  color: z.string(),
  amount: z.number(),
});

const WalletAssetsAggregatedSchema = z.object({
  name: z.string(),
  icon: z.string(),
  starting_balance: z.number(),
  amount: z.number(),
  balance: z.any(),
});

const WalletLedgersAggregatedSchema = z.object({
  name: z.string(),
  color: z.string(),
  icon: z.string(),
  amount: z.number(),
});

const WalletTransactionTypesAggregatedSchema = z.object({
  name: z.enum(["income", "expenses", "transfer"]),
  amount: z.number(),
  accumulate: z.any(),
});

type IWalletAssets = z.infer<typeof WalletAssetsSchema>;
type IWalletLedgers = z.infer<typeof WalletLedgersSchema>;
type IWalletCategories = z.infer<typeof WalletCategoriesSchema>;
type IWalletTransactions = z.infer<typeof WalletTransactionsSchema>;
type IWalletCategoriesAggregated = z.infer<
  typeof WalletCategoriesAggregatedSchema
>;
type IWalletAssetsAggregated = z.infer<typeof WalletAssetsAggregatedSchema>;
type IWalletLedgersAggregated = z.infer<typeof WalletLedgersAggregatedSchema>;
type IWalletTransactionTypesAggregated = z.infer<
  typeof WalletTransactionTypesAggregatedSchema
>;

export {
  WalletAssetsSchema,
  WalletLedgersSchema,
  WalletCategoriesSchema,
  WalletTransactionsSchema,
  WalletCategoriesAggregatedSchema,
  WalletAssetsAggregatedSchema,
  WalletLedgersAggregatedSchema,
  WalletTransactionTypesAggregatedSchema,
};

export type {
  IWalletAssets,
  IWalletLedgers,
  IWalletCategories,
  IWalletTransactions,
  IWalletCategoriesAggregated,
  IWalletAssetsAggregated,
  IWalletLedgersAggregated,
  IWalletTransactionTypesAggregated,
};
