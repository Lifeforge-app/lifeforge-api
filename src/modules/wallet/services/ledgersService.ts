import Pocketbase from "pocketbase";
import { IWalletLedger } from "../../../interfaces/wallet_interfaces";
import { WithoutPBDefault } from "../../../interfaces/pocketbase_interfaces";

export const getAllLedgers = async (pb: Pocketbase) => {
  return pb.collection("wallet_ledgers").getFullList<IWalletLedger>();
};

export const createLedger = async (
  pb: Pocketbase,
  data: WithoutPBDefault<IWalletLedger>
) => {
  const { name, icon, color } = data;

  return pb.collection("wallet_ledgers").create<IWalletLedger>({
    name,
    icon,
    color,
  });
};

export const updateLedger = async (
  pb: Pocketbase,
  id: string,
  data: WithoutPBDefault<IWalletLedger>
) => {
  const { name, icon, color } = data;

  return pb.collection("wallet_ledgers").update<IWalletLedger>(id, {
    name,
    icon,
    color,
  });
};

export const deleteLedger = async (pb: Pocketbase, id: string) => {
  return pb.collection("wallet_ledgers").delete(id);
};
