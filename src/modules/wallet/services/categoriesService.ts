import Pocketbase from "pocketbase";
import { IWalletCategory } from "../../../interfaces/wallet_interfaces";
import { WithoutPBDefault } from "../../../interfaces/pocketbase_interfaces";

export const getAllCategories = async (pb: Pocketbase) => {
  return pb.collection("wallet_categories").getFullList<IWalletCategory>();
};

export const createCategory = async (
  pb: Pocketbase,
  data: WithoutPBDefault<IWalletCategory>
) => {
  const { name, icon, color, type } = data;

  return pb.collection("wallet_categories").create<IWalletCategory>({
    name,
    icon,
    color,
    type,
  });
};

export const updateCategory = async (
  pb: Pocketbase,
  id: string,
  data: WithoutPBDefault<IWalletCategory>
) => {
  const { name, icon, color, type } = data;

  return pb.collection("wallet_categories").update<IWalletCategory>(id, {
    name,
    icon,
    color,
    type,
  });
};

export const deleteCategory = async (pb: Pocketbase, id: string) => {
  return pb.collection("wallet_categories").delete(id);
};
