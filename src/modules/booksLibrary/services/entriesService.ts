import Pocketbase from "pocketbase";
import {
  IBooksLibraryEntry,
  IBooksLibraryFileType,
} from "../../../interfaces/books_library_interfaces";

export const getAllEntries = async (
  pb: Pocketbase
): Promise<IBooksLibraryEntry[] | void> => {
  return pb
    .collection("books_library_entries")
    .getFullList<IBooksLibraryEntry>({
      sort: "-is_favourite,-created",
    })
    .catch((error) => {
      console.error(error);
    });
};

export const updateEntry = async (
  pb: Pocketbase,
  id: string,
  data: Partial<IBooksLibraryEntry>
): Promise<IBooksLibraryEntry | void> => {
  return pb
    .collection("books_library_entries")
    .update<IBooksLibraryEntry>(id, data)
    .catch((error) => {
      console.error(error);
    });
};

export const toggleFavouriteStatus = async (
  pb: Pocketbase,
  id: string
): Promise<IBooksLibraryEntry | void> => {
  const book = await pb
    .collection("books_library_entries")
    .getOne<IBooksLibraryEntry>(id)
    .catch((error) => {
      console.error(error);
    });

  if (!book) {
    return;
  }

  return pb
    .collection("books_library_entries")
    .update<IBooksLibraryEntry>(id, {
      is_favourite: !book.is_favourite,
    })
    .catch((error) => {
      console.error(error);
    });
};

export const deleteEntry = async (
  pb: Pocketbase,
  id: string
): Promise<boolean | void> => {
  const entry = await pb
    .collection("books_library_entries")
    .getOne<IBooksLibraryEntry>(id)
    .catch((error) => {
      console.error(error);
    });

  if (!entry) {
    return;
  }

  const fileTypeEntry = await pb
    .collection("books_library_file_types")
    .getFirstListItem<IBooksLibraryFileType>(`name = "${entry.extension}"`)
    .catch((error) => {
      console.error(error);
    });

  if (!fileTypeEntry) {
    return;
  }

  if (fileTypeEntry.count - 1 > 0) {
    await pb
      .collection("books_library_file_types")
      .update(fileTypeEntry.id, {
        count: fileTypeEntry.count - 1,
      })
      .catch((error) => {
        console.error(error);
      });
  } else {
    await pb
      .collection("books_library_file_types")
      .delete(fileTypeEntry.id)
      .catch((error) => {
        console.error(error);
      });
  }

  return pb
    .collection("books_library_entries")
    .delete(id)
    .catch((error) => {
      console.error(error);
    });
};
