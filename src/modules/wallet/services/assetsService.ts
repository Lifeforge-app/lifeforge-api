import Pocketbase from "pocketbase";
import { IWalletAsset } from "../../../interfaces/wallet_interfaces";
import { WithoutPBDefault } from "../../../interfaces/pocketbase_interfaces";

export const getAllAssets = async (pb: Pocketbase) => {
  const assets: IWalletAsset[] = await pb
    .collection("wallet_assets")
    .getFullList();

  const transactions = await pb.collection("wallet_transactions").getFullList();

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
) => {
  const { name, icon, starting_balance } = data;

  return pb.collection("wallet_assets").create<IWalletAsset>({
    name,
    icon,
    starting_balance,
  });
};

export const updateAsset = async (
  pb: Pocketbase,
  id: string,
  data: WithoutPBDefault<IWalletAsset>
) => {
  const { name, icon, starting_balance } = data;

  return pb.collection("wallet_assets").update<IWalletAsset>(id, {
    name,
    icon,
    starting_balance,
  });
};

export const deleteAsset = async (pb: Pocketbase, id: string) => {
  return pb.collection("wallet_assets").delete(id);
};
