import PocketBase from "pocketbase";
import { IBooksLibraryLanguage } from "../../../interfaces/books_library_interfaces";

export const getAllLanguages = async (
  pb: PocketBase,
): Promise<IBooksLibraryLanguage[]> => {
  try {
    const languages = await pb
      .collection("books_library_languages")
      .getFullList<IBooksLibraryLanguage>();
    return languages;
  } catch (error) {
    throw error;
  }
};

export const createLanguage = async (
  pb: PocketBase,
  languageData: { name: string; icon: string },
): Promise<IBooksLibraryLanguage> => {
  try {
    const language = await pb
      .collection("books_library_languages")
      .create<IBooksLibraryLanguage>(languageData);
    return language;
  } catch (error) {
    throw error;
  }
};

export const updateLanguage = async (
  pb: PocketBase,
  id: string,
  languageData: { name: string; icon: string },
): Promise<IBooksLibraryLanguage> => {
  try {
    const language = await pb
      .collection("books_library_languages")
      .update<IBooksLibraryLanguage>(id, languageData);
    return language;
  } catch (error) {
    throw error;
  }
};

export const deleteLanguage = async (
  pb: PocketBase,
  id: string,
): Promise<void> => {
  try {
    await pb.collection("books_library_languages").delete(id);
  } catch (error) {
    throw error;
  }
};
