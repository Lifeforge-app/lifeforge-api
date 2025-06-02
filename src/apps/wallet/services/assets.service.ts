import Pocketbase from "pocketbase";

import { WithoutPBDefault } from "@typescript/pocketbase_interfaces";

import { IWalletAsset } from "../wallet_interfaces";

export const getAllAssets = async (pb: Pocketbase): Promise<IWalletAsset[]> => {
  const assets = await pb
    .collection("wallet_assets_aggregated")
    .getFullList<IWalletAsset>({
      sort: "name",
    });

  return assets;
};

export const createAsset = async (
  pb: Pocketbase,
  data: WithoutPBDefault<IWalletAsset>,
): Promise<IWalletAsset> => {
  const { name, icon, starting_balance } = data;

  return await pb.collection("wallet_assets").create<IWalletAsset>({
    name,
    icon,
    starting_balance,
  });
};

export const updateAsset = async (
  pb: Pocketbase,
  id: string,
  data: WithoutPBDefault<IWalletAsset>,
): Promise<IWalletAsset> => {
  const { name, icon, starting_balance } = data;

  return await pb.collection("wallet_assets").update<IWalletAsset>(id, {
    name,
    icon,
    starting_balance,
  });
};

export const deleteAsset = async (
  pb: Pocketbase,
  id: string,
): Promise<boolean> => {
  await pb.collection("wallet_assets").delete(id);
  return true;
};
