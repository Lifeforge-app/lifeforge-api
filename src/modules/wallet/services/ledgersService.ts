import Pocketbase from "pocketbase";
import { WithoutPBDefault } from "../../../interfaces/pocketbase_interfaces";
import { IWalletLedger } from "../../../interfaces/wallet_interfaces";

/**
 * Get all wallet ledgers
 */
export const getAllLedgers = async (
  pb: Pocketbase,
): Promise<IWalletLedger[]> => {
  try {
    const ledgers: IWalletLedger[] = await pb
      .collection("wallet_ledgers")
      .getFullList<IWalletLedger>({
        sort: "name",
      });
    return ledgers;
  } catch (error) {
    throw error;
  }
};

/**
 * Create a new wallet ledger
 */
export const createLedger = async (
  pb: Pocketbase,
  data: WithoutPBDefault<IWalletLedger>,
): Promise<IWalletLedger> => {
  try {
    const { name, icon, color } = data;
    const ledger: IWalletLedger = await pb
      .collection("wallet_ledgers")
      .create<IWalletLedger>({
        name,
        icon,
        color,
      });
    return ledger;
  } catch (error) {
    throw error;
  }
};

/**
 * Update a wallet ledger
 */
export const updateLedger = async (
  pb: Pocketbase,
  id: string,
  data: WithoutPBDefault<IWalletLedger>,
): Promise<IWalletLedger> => {
  try {
    const { name, icon, color } = data;
    const ledger: IWalletLedger = await pb
      .collection("wallet_ledgers")
      .update<IWalletLedger>(id, {
        name,
        icon,
        color,
      });
    return ledger;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a wallet ledger
 */
export const deleteLedger = async (
  pb: Pocketbase,
  id: string,
): Promise<void> => {
  try {
    await pb.collection("wallet_ledgers").delete(id);
  } catch (error) {
    throw error;
  }
};
