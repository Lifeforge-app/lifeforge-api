import PocketBase from "pocketbase";

import { WithPB } from "@typescript/pocketbase_interfaces";

import { IBooksLibraryCollection } from "../typescript/books_library_interfaces";

export const getAllCollections = (
  pb: PocketBase,
): Promise<WithPB<IBooksLibraryCollection>[]> =>
  pb
    .collection("books_library_collections_aggregated")
    .getFullList<WithPB<IBooksLibraryCollection>>({
      sort: "name",
    });

export const createCollection = (
  pb: PocketBase,
  data: Omit<IBooksLibraryCollection, "amount">,
): Promise<WithPB<IBooksLibraryCollection>> =>
  pb
    .collection("books_library_collections")
    .create<WithPB<IBooksLibraryCollection>>(data);

export const updateCollection = (
  pb: PocketBase,
  id: string,
  data: Omit<IBooksLibraryCollection, "amount">,
): Promise<WithPB<IBooksLibraryCollection>> =>
  pb
    .collection("books_library_collections")
    .update<WithPB<IBooksLibraryCollection>>(id, data);

export const deleteCollection = async (pb: PocketBase, id: string) => {
  await pb.collection("books_library_collections").delete(id);
};
