import PocketBase from "pocketbase";

import { WithPB } from "@typescript/pocketbase_interfaces";

import { IWalletLedger } from "../typescript/wallet_interfaces";

export const getAllLedgers = (
  pb: PocketBase,
): Promise<WithPB<IWalletLedger>[]> =>
  pb
    .collection("wallet_ledgers_with_amount")
    .getFullList<WithPB<IWalletLedger>>({
      sort: "name",
    });

export const createLedger = (
  pb: PocketBase,
  data: Omit<IWalletLedger, "amount">,
): Promise<WithPB<IWalletLedger>> =>
  pb.collection("wallet_ledgers").create<WithPB<IWalletLedger>>(data);

export const updateLedger = (
  pb: PocketBase,
  id: string,
  data: Omit<IWalletLedger, "amount">,
): Promise<WithPB<IWalletLedger>> =>
  pb.collection("wallet_ledgers").update<WithPB<IWalletLedger>>(id, data);

export const deleteLedger = async (
  pb: PocketBase,
  id: string,
): Promise<void> => {
  await pb.collection("wallet_ledgers").delete(id);
};
