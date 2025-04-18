import { checkExistence } from "@utils/PBRecordValidator";
import { successWithBaseResponse } from "@utils/response";
import { Request, Response } from "express";
import { BaseResponse } from "../../../core/typescript/base_response";
import * as LedgersService from "../services/ledgers.service";
import { IWalletLedger } from "../wallet_interfaces";

export const getAllLedgers = async (
  req: Request,
  res: Response<BaseResponse<IWalletLedger[]>>,
) => {
  const { pb } = req;

  const ledgers = await LedgersService.getAllLedgers(pb);
  successWithBaseResponse(res, ledgers);
};

export const createLedger = async (
  req: Request,
  res: Response<BaseResponse<IWalletLedger>>,
) => {
  const { pb } = req;
  const { name, icon, color } = req.body;

  const ledger = await LedgersService.createLedger(pb, {
    name,
    icon,
    color,
  });
  successWithBaseResponse(res, ledger, 201);
};

export const updateLedger = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<IWalletLedger>>,
) => {
  const { pb } = req;
  const { id } = req.params;
  const { name, icon, color } = req.body;

  if (!(await checkExistence(req, res, "wallet_ledgers", id))) {
    return;
  }

  const ledger = await LedgersService.updateLedger(pb, id, {
    name,
    icon,
    color,
  });
  successWithBaseResponse(res, ledger);
};

export const deleteLedger = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<null>>,
) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "wallet_ledgers", id))) {
    return;
  }

  await LedgersService.deleteLedger(pb, id);
  successWithBaseResponse(res, undefined, 204);
};
