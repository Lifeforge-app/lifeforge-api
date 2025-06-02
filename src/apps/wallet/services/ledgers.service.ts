import Pocketbase from "pocketbase";

import { WithoutPBDefault } from "@typescript/pocketbase_interfaces";

import { IWalletLedger } from "../wallet_interfaces";

export const getAllLedgers = async (
  pb: Pocketbase,
): Promise<IWalletLedger[]> => {
  const ledgers: IWalletLedger[] = await pb
    .collection("wallet_ledgers_with_amount")
    .getFullList<IWalletLedger>({
      sort: "name",
    });
  return ledgers;
};

export const createLedger = async (
  pb: Pocketbase,
  data: WithoutPBDefault<IWalletLedger>,
): Promise<IWalletLedger> => {
  const { name, icon, color } = data;
  const ledger: IWalletLedger = await pb
    .collection("wallet_ledgers")
    .create<IWalletLedger>({
      name,
      icon,
      color,
    });
  return ledger;
};

export const updateLedger = async (
  pb: Pocketbase,
  id: string,
  data: WithoutPBDefault<IWalletLedger>,
): Promise<IWalletLedger> => {
  const { name, icon, color } = data;
  const ledger: IWalletLedger = await pb
    .collection("wallet_ledgers")
    .update<IWalletLedger>(id, {
      name,
      icon,
      color,
    });
  return ledger;
};

export const deleteLedger = async (
  pb: Pocketbase,
  id: string,
): Promise<void> => {
  await pb.collection("wallet_ledgers").delete(id);
};
