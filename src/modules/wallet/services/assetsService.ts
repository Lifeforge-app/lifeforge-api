import Pocketbase from "pocketbase";
import { WithoutPBDefault } from "../../../interfaces/pocketbase_interfaces";
import { IWalletAsset } from "../../../interfaces/wallet_interfaces";

/**
 * Get all wallet assets with calculated balances
 */
export const getAllAssets = async (pb: Pocketbase): Promise<IWalletAsset[]> => {
  try {
    const assets = await pb
      .collection("wallet_assets")
      .getFullList<IWalletAsset>();

    const transactions = await pb
      .collection("wallet_transactions")
      .getFullList();

    assets.forEach((asset) => {
      asset.balance = transactions
        .filter((transaction) => transaction.asset === asset.id)
        .reduce((acc, curr) => {
          return curr.side === "credit" ? acc - curr.amount : acc + curr.amount;
        }, asset.starting_balance);
    });

    return assets;
  } catch (error) {
    throw error;
  }
};

/**
 * Create a new wallet asset
 */
export const createAsset = async (
  pb: Pocketbase,
  data: WithoutPBDefault<IWalletAsset>,
): Promise<IWalletAsset> => {
  try {
    const { name, icon, starting_balance } = data;

    return await pb.collection("wallet_assets").create<IWalletAsset>({
      name,
      icon,
      starting_balance,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Update a wallet asset
 */
export const updateAsset = async (
  pb: Pocketbase,
  id: string,
  data: WithoutPBDefault<IWalletAsset>,
): Promise<IWalletAsset> => {
  try {
    const { name, icon, starting_balance } = data;

    return await pb.collection("wallet_assets").update<IWalletAsset>(id, {
      name,
      icon,
      starting_balance,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a wallet asset
 */
export const deleteAsset = async (
  pb: Pocketbase,
  id: string,
): Promise<boolean> => {
  try {
    await pb.collection("wallet_assets").delete(id);
    return true;
  } catch (error) {
    throw error;
  }
};
