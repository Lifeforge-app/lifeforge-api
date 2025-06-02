import PocketBase from "pocketbase";

import { WithPB } from "@typescript/pocketbase_interfaces";

import { IBooksLibraryLanguage } from "../typescript/books_library_interfaces";

export const getAllLanguages = (pb: PocketBase) =>
  pb
    .collection("books_library_languages_with_amount")
    .getFullList<WithPB<IBooksLibraryLanguage>>();

export const createLanguage = (
  pb: PocketBase,
  languageData: { name: string; icon: string },
) =>
  pb
    .collection("books_library_languages")
    .create<WithPB<IBooksLibraryLanguage>>(languageData);

export const updateLanguage = (
  pb: PocketBase,
  id: string,
  languageData: { name: string; icon: string },
) =>
  pb
    .collection("books_library_languages")
    .update<WithPB<IBooksLibraryLanguage>>(id, languageData);

export const deleteLanguage = (pb: PocketBase, id: string) =>
  pb.collection("books_library_languages").delete(id);
