import { Request, Response } from "express";
import { BaseResponse } from "../../../interfaces/base_response";
import { IWalletAsset } from "../../../interfaces/wallet_interfaces";
import { checkExistence } from "../../../utils/PBRecordValidator";
import { serverError, successWithBaseResponse } from "../../../utils/response";
import * as AssetsServices from "../services/assetsService";

export const getAllAssets = async (
  req: Request,
  res: Response<BaseResponse<IWalletAsset[]>>,
) => {
  const { pb } = req;

  const assets = await AssetsServices.getAllAssets(pb);

  if (!assets) {
    serverError(res, "Failed to fetch assets");
    return;
  }

  successWithBaseResponse(res, assets);
};

export const createAsset = async (
  req: Request,
  res: Response<BaseResponse<IWalletAsset>>,
) => {
  const { pb } = req;
  const { name, icon, starting_balance } = req.body;

  const asset = await AssetsServices.createAsset(pb, {
    name,
    icon,
    starting_balance,
  });

  if (!asset) {
    serverError(res, "Failed to create asset");
    return;
  }

  successWithBaseResponse(res, asset, 201);
};

export const updateAsset = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<IWalletAsset>>,
) => {
  const { pb } = req;
  const { id } = req.params;
  const { name, icon, starting_balance } = req.body;

  if (!(await checkExistence(req, res, "wallet_assets", id))) return;

  const asset = await AssetsServices.updateAsset(pb, id, {
    name,
    icon,
    starting_balance,
  });

  if (!asset) {
    serverError(res, "Failed to update asset");
    return;
  }

  successWithBaseResponse(res, asset);
};

export const deleteAsset = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<null>>,
) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "wallet_assets", id))) return;

  const isDeleted = await AssetsServices.deleteAsset(pb, id);

  if (!isDeleted) {
    serverError(res, "Failed to delete asset");
    return;
  }

  successWithBaseResponse(res, undefined, 204);
};
