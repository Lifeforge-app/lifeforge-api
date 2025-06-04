import PocketBase from "pocketbase";

import { WithPB } from "@typescript/pocketbase_interfaces";

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

export const getList = (
  pb: PocketBase,
  id: string,
): Promise<
  WithPB<
    IWishlistList & {
      total_count: number;
      bought_count: number;
      total_amount: number;
      bought_amount: number;
    }
  >
> =>
  pb.collection("wishlist_lists_aggregated").getOne<
    WithPB<
      IWishlistList & {
        total_count: number;
        bought_count: number;
        total_amount: number;
        bought_amount: number;
      }
    >
  >(id);

export const getAllLists = (
  pb: PocketBase,
): Promise<
  WithPB<
    IWishlistList & {
      total_count: number;
      bought_count: number;
      total_amount: number;
      bought_amount: number;
    }
  >[]
> =>
  pb.collection("wishlist_lists_aggregated").getFullList<
    WithPB<
      IWishlistList & {
        total_count: number;
        bought_count: number;
        total_amount: number;
        bought_amount: number;
      }
    >
  >();

export const createList = (
  pb: PocketBase,
  data: IWishlistList,
): Promise<WithPB<IWishlistList>> =>
  pb.collection("wishlist_lists").create<WithPB<IWishlistList>>(data);

export const updateList = async (
  pb: PocketBase,
  id: string,
  data: IWishlistList,
): Promise<WithPB<IWishlistList>> =>
  pb.collection("wishlist_lists").update<WithPB<IWishlistList>>(id, data);

export const deleteList = async (pb: PocketBase, id: string): Promise<void> => {
  await pb.collection("wishlist_lists").delete(id);
};
