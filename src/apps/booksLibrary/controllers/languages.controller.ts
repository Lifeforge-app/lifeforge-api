import { z } from "zod/v4";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import { zodHandler } from "@utils/asyncWrapper";

import * as LanguagesService from "../services/languages.service";
import { BooksLibraryLanguageSchema } from "../typescript/books_library_interfaces";

export const getAllLanguages = zodHandler(
  {
    response: z.array(BooksLibraryLanguageSchema),
  },
  ({ pb }) => LanguagesService.getAllLanguages(pb),
);

export const createLanguage = zodHandler(
  {
    body: BooksLibraryLanguageSchema.omit({ amount: true }),
    response: WithPBSchema(BooksLibraryLanguageSchema),
  },
  async ({ pb, body }) => await LanguagesService.createLanguage(pb, body),
  { statusCode: 201 },
);

export const updateLanguage = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    body: BooksLibraryLanguageSchema.omit({ amount: true }),
    response: WithPBSchema(BooksLibraryLanguageSchema),
  },
  async ({ pb, params: { id }, body }) =>
    await LanguagesService.updateLanguage(pb, id, body),
  {
    existenceCheck: {
      params: {
        id: "books_library_languages",
      },
    },
  },
);

export const deleteLanguage = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  },
  async ({ pb, params: { id } }) =>
    await LanguagesService.deleteLanguage(pb, id),
  {
    existenceCheck: {
      params: {
        id: "languages",
      },
    },
    statusCode: 204,
  },
);
