import PocketBase from "pocketbase";

import { WithPB } from "@typescript/pocketbase_interfaces";

import { IBooksLibraryLanguage } from "../typescript/books_library_interfaces";

export const getAllLanguages = (
  pb: PocketBase,
): Promise<WithPB<IBooksLibraryLanguage>[]> =>
  pb
    .collection("books_library_languages_with_amount")
    .getFullList<WithPB<IBooksLibraryLanguage>>();

export const createLanguage = (
  pb: PocketBase,
  languageData: { name: string; icon: string },
): Promise<WithPB<IBooksLibraryLanguage>> =>
  pb
    .collection("books_library_languages")
    .create<WithPB<IBooksLibraryLanguage>>(languageData);

export const updateLanguage = (
  pb: PocketBase,
  id: string,
  languageData: { name: string; icon: string },
): Promise<WithPB<IBooksLibraryLanguage>> =>
  pb
    .collection("books_library_languages")
    .update<WithPB<IBooksLibraryLanguage>>(id, languageData);

export const deleteLanguage = (pb: PocketBase, id: string): Promise<boolean> =>
  pb.collection("books_library_languages").delete(id);
