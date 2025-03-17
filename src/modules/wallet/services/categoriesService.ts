import Pocketbase from "pocketbase";
import { WithoutPBDefault } from "../../../interfaces/pocketbase_interfaces";
import { IWalletCategory } from "../../../interfaces/wallet_interfaces";

/**
 * Get all wallet categories
 */
export const getAllCategories = async (
  pb: Pocketbase,
): Promise<IWalletCategory[]> => {
  try {
    const categories: IWalletCategory[] = await pb
      .collection("wallet_categories")
      .getFullList<IWalletCategory>();
    return categories;
  } catch (error) {
    throw error;
  }
};

/**
 * Create a new wallet category
 */
export const createCategory = async (
  pb: Pocketbase,
  data: WithoutPBDefault<IWalletCategory>,
): Promise<IWalletCategory> => {
  try {
    const { name, icon, color, type } = data;

    const category: IWalletCategory = await pb
      .collection("wallet_categories")
      .create<IWalletCategory>({
        name,
        icon,
        color,
        type,
      });
    return category;
  } catch (error) {
    throw error;
  }
};

/**
 * Update a wallet category
 */
export const updateCategory = async (
  pb: Pocketbase,
  id: string,
  data: WithoutPBDefault<IWalletCategory>,
): Promise<IWalletCategory> => {
  try {
    const { name, icon, color, type } = data;

    const category: IWalletCategory = await pb
      .collection("wallet_categories")
      .update<IWalletCategory>(id, {
        name,
        icon,
        color,
        type,
      });
    return category;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a wallet category
 */
export const deleteCategory = async (
  pb: Pocketbase,
  id: string,
): Promise<void> => {
  try {
    await pb.collection("wallet_categories").delete(id);
  } catch (error) {
    throw error;
  }
};
