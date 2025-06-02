import PocketBase from "pocketbase";

import { IBooksLibraryCategory } from "../typescript/books_library_interfaces";

export const getAllCategories = async (pb: PocketBase): Promise => {
  const categories = await pb
    .collection("books_library_categories_with_amount")
    .getFullList<IBooksLibraryCategory>({
      sort: "name",
    });
  return categories;
};

export const createCategory = async (
  pb: PocketBase,
  data: { name: string; icon: string },
): Promise => {
  const category = await pb
    .collection("books_library_categories")
    .create<IBooksLibraryCategory>(data);
  return category;
};

export const updateCategory = async (
  pb: PocketBase,
  id: string,
  data: Partial,
): Promise => {
  const category = await pb
    .collection("books_library_categories")
    .update<IBooksLibraryCategory>(id, data);
  return category;
};

export const deleteCategory = async (pb: PocketBase, id: string): Promise => {
  await pb.collection("books_library_categories").delete(id);
};
