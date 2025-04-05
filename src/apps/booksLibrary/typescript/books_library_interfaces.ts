import * as s from "superstruct";
import { BasePBCollectionSchema } from "../../../core/typescript/pocketbase_interfaces";

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
  }),
);

const BooksLibraryCategorySchema = s.assign(
  BasePBCollectionSchema,
  s.object({
    name: s.string(),
    icon: s.string(),
    amount: s.number(),
  }),
);

const BooksLibraryLanguageSchema = s.assign(
  BasePBCollectionSchema,
  s.object({
    name: s.string(),
    icon: s.string(),
    amount: s.number(),
  }),
);

const BooksLibraryFileTypeSchema = s.assign(
  BasePBCollectionSchema,
  s.object({
    name: s.string(),
    amount: s.number(),
  }),
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
type IBooksLibraryFileType = s.Infer<typeof BooksLibraryFileTypeSchema>;
type IBooksLibraryDownloadProcess = s.Infer<
  typeof BooksLibraryDownloadProcessSchema
>;

export {
  BooksLibraryCategorySchema,
  BooksLibraryDownloadProcessSchema,
  BooksLibraryEntrySchema,
  BooksLibraryFileTypeSchema,
  BooksLibraryLanguageSchema,
};
export type {
  IBooksLibraryCategory,
  IBooksLibraryDownloadProcess,
  IBooksLibraryEntry,
  IBooksLibraryFileType,
  IBooksLibraryLanguage,
};
