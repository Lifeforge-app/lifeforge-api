import { z } from "zod/v4";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import { forgeController } from "@utils/forgeController";

import * as AssetsService from "../services/assets.service";
import { WalletAssetSchema } from "../typescript/wallet_interfaces";

export const getAllAssets = forgeController(
  {
    response: z.array(WithPBSchema(WalletAssetSchema)),
  },
  async ({ pb }) => await AssetsService.getAllAssets(pb),
);

export const createAsset = forgeController(
  {
    body: WalletAssetSchema.pick({
      name: true,
      icon: true,
      starting_balance: true,
    }),
    response: WithPBSchema(WalletAssetSchema),
  },
  async ({ pb, body }) => await AssetsService.createAsset(pb, body),
  {
    statusCode: 201,
  },
);

export const updateAsset = forgeController(
  {
    params: z.object({
      id: z.string(),
    }),
    body: WalletAssetSchema.pick({
      name: true,
      icon: true,
      starting_balance: true,
    }),
    response: WithPBSchema(WalletAssetSchema),
  },
  async ({ pb, params: { id }, body }) =>
    await AssetsService.updateAsset(pb, id, body),
  {
    existenceCheck: {
      params: {
        id: "wallet_assets",
      },
    },
  },
);

export const deleteAsset = forgeController(
  {
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  },
  async ({ pb, params: { id } }) => await AssetsService.deleteAsset(pb, id),
  {
    existenceCheck: {
      params: {
        id: "wallet_assets",
      },
    },
    statusCode: 204,
  },
);
