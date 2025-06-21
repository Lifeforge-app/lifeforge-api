import { forgeController } from "@functions/forgeController";
import { z } from "zod/v4";

import * as UtilsService from "../services/utils.service";
import { WalletIncomeExpensesSummarySchema } from "../wallet_interfaces";

export const getTypesCount = forgeController(
  {
    response: z.record(
      z.string(),
      z.object({
        amount: z.number(),
        accumulate: z.number(),
      }),
    ),
  },
  async ({ pb }) => await UtilsService.getTypesCount(pb),
);

export const getIncomeExpensesSummary = forgeController(
  {
    query: z.object({
      year: z.string(),
      month: z.string(),
    }),
    response: WalletIncomeExpensesSummarySchema,
  },
  async ({ pb, query: { year, month } }) =>
    await UtilsService.getIncomeExpensesSummary(pb, year, month),
);

export const getExpensesBreakdown = forgeController(
  {
    query: z.object({
      year: z
        .string()
        .transform((val) => parseInt(val) || new Date().getFullYear()),
      month: z
        .string()
        .transform((val) => parseInt(val) || new Date().getMonth() + 1),
    }),
    response: z.record(
      z.string(),
      z.object({
        amount: z.number(),
        count: z.number(),
        percentage: z.number(),
      }),
    ),
  },
  async ({ pb, query: { year, month } }) =>
    await UtilsService.getExpensesBreakdown(pb, year, month),
);
