import PocketBase from "pocketbase";

import { WithPB } from "@typescript/pocketbase_interfaces";

import { IBooksLibraryFileType } from "../typescript/books_library_interfaces";

export const getAllFileTypes = (
  pb: PocketBase,
): Promise<WithPB<IBooksLibraryFileType>[]> =>
  pb
    .collection("books_library__file_types_aggregated")
    .getFullList<WithPB<IBooksLibraryFileType>>({
      sort: "name",
    });
