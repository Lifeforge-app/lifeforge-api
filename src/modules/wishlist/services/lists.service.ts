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
  try {
    return await pb.collection("wishlist_lists").getOne(id);
  } catch (error) {
    throw error;
  }
};

export const getAllLists = async (pb: PocketBase): Promise<IWishlistList[]> => {
  try {
    const result = await pb
      .collection("wishlist_lists")
      .getFullList<IWishlistList>();
    return result;
  } catch (error) {
    throw error;
  }
};

export const createList = async (
  pb: PocketBase,
  data: { name: string; description?: string; color: string; icon: string },
): Promise<IWishlistList> => {
  try {
    return await pb.collection("wishlist_lists").create(data);
  } catch (error) {
    throw error;
  }
};

export const updateList = async (
  pb: PocketBase,
  id: string,
  data: { name: string; description?: string; color: string; icon: string },
): Promise<IIdeaBoxContainer> => {
  try {
    return await pb.collection("wishlist_lists").update(id, data);
  } catch (error) {
    throw error;
  }
};

export const deleteList = async (pb: PocketBase, id: string): Promise<void> => {
  try {
    await pb.collection("wishlist_lists").delete(id);
  } catch (error) {
    throw error;
  }
};
