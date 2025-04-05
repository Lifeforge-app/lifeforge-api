import Pocketbase from "pocketbase";
import { WithoutPBDefault } from "../../../core/typescript/pocketbase_interfaces";
import { IWalletCategory } from "../wallet_interfaces";

export const getAllCategories = async (
  pb: Pocketbase,
): Promise<IWalletCategory[]> => {
  const categories: IWalletCategory[] = await pb
    .collection("wallet_categories")
    .getFullList<IWalletCategory>({
      sort: "name",
    });
  return categories;
};

export const createCategory = async (
  pb: Pocketbase,
  data: WithoutPBDefault<IWalletCategory>,
): Promise<IWalletCategory> => {
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
};

export const updateCategory = async (
  pb: Pocketbase,
  id: string,
  data: WithoutPBDefault<IWalletCategory>,
): Promise<IWalletCategory> => {
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
};

export const deleteCategory = async (
  pb: Pocketbase,
  id: string,
): Promise<void> => {
  await pb.collection("wallet_categories").delete(id);
};
