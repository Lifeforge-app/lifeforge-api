import PocketBase from "pocketbase";
import { IBooksLibraryCategory } from "../typescript/books_library_interfaces";

export const getAllCategories = async (
  pb: PocketBase,
): Promise<IBooksLibraryCategory[] | null> => {
  try {
    const categories = await pb
      .collection("books_library_categories")
      .getFullList<IBooksLibraryCategory>({
        sort: "name",
      });
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return null;
  }
};

export const createCategory = async (
  pb: PocketBase,
  data: { name: string; icon: string },
): Promise<IBooksLibraryCategory | null> => {
  try {
    const category = await pb
      .collection("books_library_categories")
      .create<IBooksLibraryCategory>(data);
    return category;
  } catch (error) {
    console.error("Error creating category:", error);
    return null;
  }
};

export const updateCategory = async (
  pb: PocketBase,
  id: string,
  data: Partial<IBooksLibraryCategory>,
): Promise<IBooksLibraryCategory | null> => {
  try {
    const category = await pb
      .collection("books_library_categories")
      .update<IBooksLibraryCategory>(id, data);
    return category;
  } catch (error) {
    console.error("Error updating category:", error);
    return null;
  }
};

export const deleteCategory = async (
  pb: PocketBase,
  id: string,
): Promise<boolean> => {
  try {
    await pb.collection("books_library_categories").delete(id);
    return true;
  } catch (error) {
    console.error("Error deleting category:", error);
    return false;
  }
};
