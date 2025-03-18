import PocketBase from "pocketbase";
import { IIdeaBoxContainer } from "../../ideaBox/typescript/ideabox_interfaces";
import { IWishlistList } from "../typescript/wishlist_interfaces";

export const checkListExists = async (
  pb: PocketBase,
  id: string,
): Promise<boolean> => {
  try {
    await pb.collection("wishlist_lists").getOne(id);
    return true;
  } catch (error) {
    return false;
  }
};

export const getList = async (
  pb: PocketBase,
  id: string,
): Promise<IWishlistList> => {
  return await pb.collection("wishlist_lists").getOne(id);
};

export const getAllLists = async (pb: PocketBase): Promise<IWishlistList[]> => {
  const result = await pb
    .collection("wishlist_lists")
    .getFullList<IWishlistList>();
  return result;
};

export const createList = async (
  pb: PocketBase,
  data: { name: string; description?: string; color: string; icon: string },
): Promise<IWishlistList> => {
  return await pb.collection("wishlist_lists").create(data);
};

export const updateList = async (
  pb: PocketBase,
  id: string,
  data: { name: string; description?: string; color: string; icon: string },
): Promise<IIdeaBoxContainer> => {
  return await pb.collection("wishlist_lists").update(id, data);
};

export const deleteList = async (pb: PocketBase, id: string): Promise<void> => {
  await pb.collection("wishlist_lists").delete(id);
};
