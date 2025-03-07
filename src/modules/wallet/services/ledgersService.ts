import Pocketbase from "pocketbase";
import { IWalletLedger } from "../../../interfaces/wallet_interfaces";
import { WithoutPBDefault } from "../../../interfaces/pocketbase_interfaces";

export const getAllLedgers = async (
  pb: Pocketbase
): Promise<IWalletLedger[] | void> => {
  return pb
    .collection("wallet_ledgers")
    .getFullList<IWalletLedger>({
      sort: "name",
    })
    .catch((error) => {
      console.error(error);
    });
};

export const createLedger = async (
  pb: Pocketbase,
  data: WithoutPBDefault<IWalletLedger>
): Promise<IWalletLedger | void> => {
  const { name, icon, color } = data;

  return pb
    .collection("wallet_ledgers")
    .create<IWalletLedger>({
      name,
      icon,
      color,
    })
    .catch((error) => {
      console.error(error);
    });
};

export const updateLedger = async (
  pb: Pocketbase,
  id: string,
  data: WithoutPBDefault<IWalletLedger>
): Promise<IWalletLedger | void> => {
  const { name, icon, color } = data;

  return pb
    .collection("wallet_ledgers")
    .update<IWalletLedger>(id, {
      name,
      icon,
      color,
    })
    .catch((error) => {
      console.error(error);
    });
};

export const deleteLedger = async (
  pb: Pocketbase,
  id: string
): Promise<boolean | void> => {
  return pb
    .collection("wallet_ledgers")
    .delete(id)
    .catch((error) => {
      console.error(error);
    });
};
