import PocketBase from "pocketbase";
import { IBooksLibraryFileType } from "../../../interfaces/books_library_interfaces";

export const getAllFileTypes = async (
  pb: PocketBase,
): Promise<IBooksLibraryFileType[] | null> => {
  try {
    const fileTypes = await pb
      .collection("books_library_file_types")
      .getFullList<IBooksLibraryFileType>({
        sort: "name",
      });
    return fileTypes;
  } catch (error) {
    console.error("Error fetching file types:", error);
    return null;
  }
};
