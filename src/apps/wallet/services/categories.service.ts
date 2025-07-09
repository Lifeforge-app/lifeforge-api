import PocketBase from "pocketbase";

import { WithPB } from "@typescript/pocketbase_interfaces";

import { IWalletCategory } from "../typescript/wallet_interfaces";

export const getAllCategories = (
  pb: PocketBase,
): Promise<WithPB<IWalletCategory>[]> =>
  pb
    .collection("wallet_categories_aggregated")
    .getFullList<WithPB<IWalletCategory>>({
      sort: "name",
    });

export const createCategory = (
  pb: PocketBase,
  data: Omit<IWalletCategory, "amount">,
): Promise<WithPB<IWalletCategory>> =>
  pb.collection("wallet_categories").create<WithPB<IWalletCategory>>(data);

export const updateCategory = (
  pb: PocketBase,
  id: string,
  data: Omit<IWalletCategory, "amount">,
): Promise<WithPB<IWalletCategory>> =>
  pb.collection("wallet_categories").update<WithPB<IWalletCategory>>(id, data);

export const deleteCategory = async (
  pb: PocketBase,
  id: string,
): Promise<void> => {
  await pb.collection("wallet_categories").delete(id);
};
