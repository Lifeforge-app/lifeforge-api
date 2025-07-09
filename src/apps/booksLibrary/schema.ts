// This file is auto-generated. DO NOT EDIT IT MANUALLY.
// Generated for module: booksLibrary
// Generated at: 2025-07-09T11:52:26.854Z
// Contains: books_library__collections, books_library__languages, books_library__entries, books_library__file_types, books_library__file_types_aggregated, books_library__languages_aggregated, books_library__collections_aggregated
import { z } from "zod/v4";

const BooksLibraryCollectionsSchema = z.object({
  name: z.string(),
  icon: z.string(),
});

const BooksLibraryLanguagesSchema = z.object({
  name: z.string(),
  icon: z.string(),
});

const BooksLibraryEntriesSchema = z.object({
  title: z.string(),
  authors: z.string(),
  md5: z.string(),
  year_published: z.number(),
  publisher: z.string(),
  languages: z.string(),
  collection: z.string(),
  extension: z.string(),
  edition: z.string(),
  size: z.number(),
  isbn: z.string(),
  file: z.string(),
  thumbnail: z.string(),
  is_favourite: z.boolean(),
  is_read: z.boolean(),
  time_finished: z.string(),
});

const BooksLibraryFileTypesSchema = z.object({
  name: z.string(),
});

const BooksLibraryFileTypesAggregatedSchema = z.object({
  name: z.string(),
  amount: z.number(),
});

const BooksLibraryLanguagesAggregatedSchema = z.object({
  name: z.string(),
  icon: z.string(),
  amount: z.number(),
});

const BooksLibraryCollectionsAggregatedSchema = z.object({
  name: z.string(),
  icon: z.string(),
  amount: z.number(),
});

type IBooksLibraryCollections = z.infer<typeof BooksLibraryCollectionsSchema>;
type IBooksLibraryLanguages = z.infer<typeof BooksLibraryLanguagesSchema>;
type IBooksLibraryEntries = z.infer<typeof BooksLibraryEntriesSchema>;
type IBooksLibraryFileTypes = z.infer<typeof BooksLibraryFileTypesSchema>;
type IBooksLibraryFileTypesAggregated = z.infer<
  typeof BooksLibraryFileTypesAggregatedSchema
>;
type IBooksLibraryLanguagesAggregated = z.infer<
  typeof BooksLibraryLanguagesAggregatedSchema
>;
type IBooksLibraryCollectionsAggregated = z.infer<
  typeof BooksLibraryCollectionsAggregatedSchema
>;

export {
  BooksLibraryCollectionsSchema,
  BooksLibraryLanguagesSchema,
  BooksLibraryEntriesSchema,
  BooksLibraryFileTypesSchema,
  BooksLibraryFileTypesAggregatedSchema,
  BooksLibraryLanguagesAggregatedSchema,
  BooksLibraryCollectionsAggregatedSchema,
};

export type {
  IBooksLibraryCollections,
  IBooksLibraryLanguages,
  IBooksLibraryEntries,
  IBooksLibraryFileTypes,
  IBooksLibraryFileTypesAggregated,
  IBooksLibraryLanguagesAggregated,
  IBooksLibraryCollectionsAggregated,
};
