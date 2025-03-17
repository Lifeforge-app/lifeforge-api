import Pocketbase from "pocketbase";
import {
  IBooksLibraryEntry,
  IBooksLibraryFileType,
} from "../typescript/books_library_interfaces";

export const getAllEntries = async (
  pb: Pocketbase,
): Promise<IBooksLibraryEntry[] | null> => {
  try {
    return await pb
      .collection("books_library_entries")
      .getFullList<IBooksLibraryEntry>({
        sort: "-is_favourite,-created",
      });
  } catch (error) {
    console.error("Error fetching entries:", error);
    return null;
  }
};

export const updateEntry = async (
  pb: Pocketbase,
  id: string,
  data: Partial<IBooksLibraryEntry>,
): Promise<IBooksLibraryEntry | null> => {
  try {
    return await pb
      .collection("books_library_entries")
      .update<IBooksLibraryEntry>(id, data);
  } catch (error) {
    console.error("Error updating entry:", error);
    return null;
  }
};

export const toggleFavouriteStatus = async (
  pb: Pocketbase,
  id: string,
): Promise<IBooksLibraryEntry | null> => {
  try {
    const book = await pb
      .collection("books_library_entries")
      .getOne<IBooksLibraryEntry>(id);

    if (!book) {
      return null;
    }

    return await pb
      .collection("books_library_entries")
      .update<IBooksLibraryEntry>(id, {
        is_favourite: !book.is_favourite,
      });
  } catch (error) {
    console.error("Error toggling favourite status:", error);
    return null;
  }
};

export const deleteEntry = async (
  pb: Pocketbase,
  id: string,
): Promise<boolean> => {
  try {
    const entry = await pb
      .collection("books_library_entries")
      .getOne<IBooksLibraryEntry>(id);

    if (!entry) {
      return false;
    }

    const fileTypeEntry = await pb
      .collection("books_library_file_types")
      .getFirstListItem<IBooksLibraryFileType>(`name = "${entry.extension}"`);

    if (!fileTypeEntry) {
      return false;
    }

    if (fileTypeEntry.count - 1 > 0) {
      await pb.collection("books_library_file_types").update(fileTypeEntry.id, {
        count: fileTypeEntry.count - 1,
      });
    } else {
      await pb.collection("books_library_file_types").delete(fileTypeEntry.id);
    }

    await pb.collection("books_library_entries").delete(id);
    return true;
  } catch (error) {
    console.error("Error deleting entry:", error);
    return false;
  }
};
