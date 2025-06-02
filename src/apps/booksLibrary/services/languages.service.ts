import PocketBase from "pocketbase";

import { IBooksLibraryLanguage } from "../typescript/books_library_interfaces";

export const getAllLanguages = async (pb: PocketBase): Promise => {
  const languages = await pb
    .collection("books_library_languages_with_amount")
    .getFullList<IBooksLibraryLanguage>();
  return languages;
};

export const createLanguage = async (
  pb: PocketBase,
  languageData: { name: string; icon: string },
): Promise => {
  const language = await pb
    .collection("books_library_languages")
    .create<IBooksLibraryLanguage>(languageData);
  return language;
};

export const updateLanguage = async (
  pb: PocketBase,
  id: string,
  languageData: { name: string; icon: string },
): Promise => {
  const language = await pb
    .collection("books_library_languages")
    .update<IBooksLibraryLanguage>(id, languageData);
  return language;
};

export const deleteLanguage = async (pb: PocketBase, id: string): Promise => {
  await pb.collection("books_library_languages").delete(id);
};
