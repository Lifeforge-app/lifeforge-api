import { Request, Response } from "express";
import { BaseResponse } from "../../../interfaces/base_response";
import { IWalletLedger } from "../../../interfaces/wallet_interfaces";
import { checkExistence } from "../../../utils/PBRecordValidator";
import { serverError, successWithBaseResponse } from "../../../utils/response";
import * as LedgersService from "../services/ledgersService";

export const getAllLedgers = async (
  req: Request,
  res: Response<BaseResponse<IWalletLedger[]>>,
) => {
  const { pb } = req;

  const ledgers = await LedgersService.getAllLedgers(pb);

  if (!ledgers) {
    serverError(res, "Failed to fetch ledgers");
    return;
  }

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

  if (!ledger) {
    serverError(res, "Failed to fetch ledgers");
    return;
  }

  successWithBaseResponse(res, ledger, 201);
};

export const updateLedger = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<IWalletLedger>>,
) => {
  const { pb } = req;
  const { id } = req.params;
  const { name, icon, color } = req.body;

  if (!(await checkExistence(req, res, "wallet_ledgers", id))) return;

  const ledger = await LedgersService.updateLedger(pb, id, {
    name,
    icon,
    color,
  });

  if (!ledger) {
    serverError(res, "Failed to update ledger");
    return;
  }

  successWithBaseResponse(res, ledger);
};

export const deleteLedger = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<null>>,
) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "wallet_ledgers", id))) return;

  const isDeleted = await LedgersService.deleteLedger(pb, id);

  if (!isDeleted) {
    serverError(res, "Failed to delete ledger");
    return;
  }

  successWithBaseResponse(res, undefined, 204);
};
