import PocketBase from "pocketbase";

import { WithPB } from "@typescript/pocketbase_interfaces";

import { IBooksLibraryCategory } from "../typescript/books_library_interfaces";

export const getAllCategories = (
  pb: PocketBase,
): Promise<WithPB<IBooksLibraryCategory>[]> =>
  pb
    .collection("books_library_categories_with_amount")
    .getFullList<WithPB<IBooksLibraryCategory>>({
      sort: "name",
    });

export const createCategory = (
  pb: PocketBase,
  data: Omit<IBooksLibraryCategory, "amount">,
): Promise<WithPB<IBooksLibraryCategory>> =>
  pb
    .collection("books_library_categories")
    .create<WithPB<IBooksLibraryCategory>>(data);

export const updateCategory = (
  pb: PocketBase,
  id: string,
  data: Omit<IBooksLibraryCategory, "amount">,
): Promise<WithPB<IBooksLibraryCategory>> =>
  pb
    .collection("books_library_categories")
    .update<WithPB<IBooksLibraryCategory>>(id, data);

export const deleteCategory = (pb: PocketBase, id: string): Promise<boolean> =>
  pb.collection("books_library_categories").delete(id);
