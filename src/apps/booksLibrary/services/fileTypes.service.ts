import PocketBase from "pocketbase";

import { WithPB } from "@typescript/pocketbase_interfaces";

import { IBooksLibraryFileType } from "../typescript/books_library_interfaces";

export const getAllFileTypes = (pb: PocketBase) =>
  pb
    .collection("books_library_file_types_with_amount")
    .getFullList<WithPB<IBooksLibraryFileType>>({
      sort: "name",
    });
