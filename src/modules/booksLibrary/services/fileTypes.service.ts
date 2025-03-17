import PocketBase from "pocketbase";
import { IBooksLibraryFileType } from "../typescript/books_library_interfaces";

export const getAllFileTypes = async (
  pb: PocketBase,
): Promise<IBooksLibraryFileType[]> => {
  const fileTypes = await pb
    .collection("books_library_file_types")
    .getFullList<IBooksLibraryFileType>({
      sort: "name",
    });
  return fileTypes;
};
