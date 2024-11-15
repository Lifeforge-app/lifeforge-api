import * as s from "superstruct";
import { BasePBCollectionSchema } from "./pocketbase_interfaces.js";

const BooksLibraryEntrySchema = s.assign(
  BasePBCollectionSchema,
  s.object({
    md5: s.string(),
    authors: s.string(),
    category: s.string(),
    edition: s.string(),
    extension: s.string(),
    file: s.string(),
    isbn: s.string(),
    languages: s.array(s.string()),
    publisher: s.string(),
    size: s.number(),
    thumbnail: s.string(),
    title: s.string(),
    year_published: s.number(),
    is_favourite: s.boolean(),
  })
);

const BooksLibraryCategorySchema = s.assign(
  BasePBCollectionSchema,
  s.object({
    name: s.string(),
    icon: s.string(),
  })
);

const BooksLibraryLanguageSchema = s.assign(
  BasePBCollectionSchema,
  s.object({
    name: s.string(),
    icon: s.string(),
  })
);

const BooksLibraryDownloadProcessSchema = s.object({
  kill: s.func(),
  downloaded: s.string(),
  total: s.string(),
  percentage: s.string(),
  speed: s.string(),
  ETA: s.string(),
  metadata: s.any(),
});

type IBooksLibraryEntry = s.Infer<typeof BooksLibraryEntrySchema>;
type IBooksLibraryCategory = s.Infer<typeof BooksLibraryCategorySchema>;
type IBooksLibraryLanguage = s.Infer<typeof BooksLibraryLanguageSchema>;
type IBooksLibraryDownloadProcess = s.Infer<
  typeof BooksLibraryDownloadProcessSchema
>;

export {
  BooksLibraryEntrySchema,
  BooksLibraryCategorySchema,
  BooksLibraryLanguageSchema,
  BooksLibraryDownloadProcessSchema,
};
export type {
  IBooksLibraryEntry,
  IBooksLibraryCategory,
  IBooksLibraryLanguage,
  IBooksLibraryDownloadProcess,
};
