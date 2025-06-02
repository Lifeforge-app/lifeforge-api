import { Request, Response } from "express";

import { BaseResponse } from "@typescript/base_response";

import { successWithBaseResponse } from "@utils/response";

import * as UtilsService from "../services/utils.service";
import { IWalletIncomeExpensesSummary } from "../wallet_interfaces";

export const getTypesCount = async (
  req: Request,
  res: Response<
    BaseResponse<{
      [key: string]: {
        amount: number;
        accumulate: number;
      };
    }>
  >,
) => {
  const { pb } = req;
  const typesCount = await UtilsService.getTypesCount(pb);
  successWithBaseResponse(res, typesCount);
};

export const getIncomeExpensesSummary = async (
  req: Request<{}, {}, {}, { year: string; month: string }>,
  res: Response<BaseResponse<IWalletIncomeExpensesSummary>>,
) => {
  const { pb } = req;
  const { year, month } = req.query;

  const summary = await UtilsService.getIncomeExpensesSummary(pb, year, month);
  successWithBaseResponse(res, summary);
};

export const getExpensesBreakdown = async (req: Request, res: Response) => {
  const { year, month } = req.query as { year: string; month: string };

  const expensesBreakdown = await UtilsService.getExpensesBreakdown({
    pb: req.pb,
    year: +year,
    month: +month,
  });

  successWithBaseResponse(res, expensesBreakdown);
};
