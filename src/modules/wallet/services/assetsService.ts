import Pocketbase from "pocketbase";
import { IWalletAsset } from "../../../interfaces/wallet_interfaces";
import { WithoutPBDefault } from "../../../interfaces/pocketbase_interfaces";

export const getAllAssets = async (
  pb: Pocketbase
): Promise<IWalletAsset[] | void> => {
  const assets = await pb
    .collection("wallet_assets")
    .getFullList<IWalletAsset>()
    .catch((error) => {
      console.error(error);
    });

  const transactions = await pb
    .collection("wallet_transactions")
    .getFullList()
    .catch((error) => {
      console.error(error);
    });

  if (!assets || !transactions) {
    return;
  }

  assets.forEach((asset) => {
    asset.balance = transactions
      .filter((transaction) => transaction.asset === asset.id)
      .reduce((acc, curr) => {
        return curr.side === "credit" ? acc - curr.amount : acc + curr.amount;
      }, asset.starting_balance);
  });

  return assets;
};

export const createAsset = async (
  pb: Pocketbase,
  data: WithoutPBDefault<IWalletAsset>
): Promise<IWalletAsset | void> => {
  const { name, icon, starting_balance } = data;

  return pb
    .collection("wallet_assets")
    .create<IWalletAsset>({
      name,
      icon,
      starting_balance,
    })
    .catch((error) => {
      console.error(error);
    });
};

export const updateAsset = async (
  pb: Pocketbase,
  id: string,
  data: WithoutPBDefault<IWalletAsset>
): Promise<IWalletAsset | void> => {
  const { name, icon, starting_balance } = data;

  return pb
    .collection("wallet_assets")
    .update<IWalletAsset>(id, {
      name,
      icon,
      starting_balance,
    })
    .catch((error) => {
      console.error(error);
    });
};

export const deleteAsset = async (
  pb: Pocketbase,
  id: string
): Promise<boolean | void> => {
  return pb
    .collection("wallet_assets")
    .delete(id)
    .catch((error) => {
      console.error(error);
    });
};
