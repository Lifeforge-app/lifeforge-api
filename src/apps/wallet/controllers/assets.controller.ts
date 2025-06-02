import { Request, Response } from "express";

import { BaseResponse } from "@typescript/base_response";

import { checkExistence } from "@utils/PBRecordValidator";
import { successWithBaseResponse } from "@utils/response";

import * as AssetsServices from "../services/assets.service";
import { IWalletAsset } from "../wallet_interfaces";

export const getAllAssets = async (
  req: Request,
  res: Response<BaseResponse<IWalletAsset[]>>,
) => {
  const { pb } = req;

  const assets = await AssetsServices.getAllAssets(pb);
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
  successWithBaseResponse(res, asset, 201);
};

export const updateAsset = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<IWalletAsset>>,
) => {
  const { pb } = req;
  const { id } = req.params;
  const { name, icon, starting_balance } = req.body;

  if (!(await checkExistence(req, res, "wallet_assets", id))) {
    return;
  }

  const asset = await AssetsServices.updateAsset(pb, id, {
    name,
    icon,
    starting_balance,
  });
  successWithBaseResponse(res, asset);
};

export const deleteAsset = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<null>>,
) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "wallet_assets", id))) {
    return;
  }

  await AssetsServices.deleteAsset(pb, id);
  successWithBaseResponse(res, undefined, 204);
};
