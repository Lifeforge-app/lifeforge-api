import Pocketbase from "pocketbase";
import { WithoutPBDefault } from "../../../interfaces/pocketbase_interfaces";
import { IWalletCategory } from "../../../interfaces/wallet_interfaces";

export const getAllCategories = async (
  pb: Pocketbase,
): Promise<IWalletCategory[] | void> => {
  return pb
    .collection("wallet_categories")
    .getFullList<IWalletCategory>()
    .catch((error) => {
      console.error(error);
    });
};

export const createCategory = async (
  pb: Pocketbase,
  data: WithoutPBDefault<IWalletCategory>,
): Promise<IWalletCategory | void> => {
  const { name, icon, color, type } = data;

  return pb
    .collection("wallet_categories")
    .create<IWalletCategory>({
      name,
      icon,
      color,
      type,
    })
    .catch((error) => {
      console.error(error);
    });
};

export const updateCategory = async (
  pb: Pocketbase,
  id: string,
  data: WithoutPBDefault<IWalletCategory>,
): Promise<IWalletCategory | void> => {
  const { name, icon, color, type } = data;

  return pb
    .collection("wallet_categories")
    .update<IWalletCategory>(id, {
      name,
      icon,
      color,
      type,
    })
    .catch((error) => {
      console.error(error);
    });
};

export const deleteCategory = async (
  pb: Pocketbase,
  id: string,
): Promise<boolean | void> => {
  return pb
    .collection("wallet_categories")
    .delete(id)
    .catch((error) => {
      console.error(error);
    });
};
