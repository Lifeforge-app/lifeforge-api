import PocketBase from "pocketbase";

import { WithPB } from "@typescript/pocketbase_interfaces";

import { IWalletAsset } from "../typescript/wallet_interfaces";

export const getAllAssets = (pb: PocketBase): Promise<WithPB<IWalletAsset>[]> =>
  pb.collection("wallet_assets_aggregated").getFullList<WithPB<IWalletAsset>>({
    sort: "name",
  });

export const createAsset = (
  pb: PocketBase,
  data: Pick<IWalletAsset, "name" | "icon" | "starting_balance">,
): Promise<WithPB<IWalletAsset>> =>
  pb.collection("wallet_assets").create<WithPB<IWalletAsset>>(data);

export const updateAsset = (
  pb: PocketBase,
  id: string,
  data: Pick<IWalletAsset, "name" | "icon" | "starting_balance">,
): Promise<WithPB<IWalletAsset>> =>
  pb.collection("wallet_assets").update<WithPB<IWalletAsset>>(id, data);

export const deleteAsset = async (
  pb: PocketBase,
  id: string,
): Promise<void> => {
  await pb.collection("wallet_assets").delete(id);
};
