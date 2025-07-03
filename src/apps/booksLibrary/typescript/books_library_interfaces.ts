import { z } from "zod/v4";

const BooksLibraryEntrySchema = z.object({
  md5: z.string(),
  authors: z.string(),
  collection: z.string(),
  edition: z.string(),
  extension: z.string(),
  file: z.string(),
  isbn: z.string(),
  languages: z.array(z.string()),
  publisher: z.string(),
  size: z.number(),
  thumbnail: z.string(),
  title: z.string(),
  year_published: z.number(),
  is_favourite: z.boolean(),
  is_read: z.boolean(),
  time_finished: z.string(),
});

const BooksLibraryCollectionSchema = z.object({
  name: z.string(),
  icon: z.string(),
  amount: z.number(),
});

const BooksLibraryLanguageSchema = z.object({
  name: z.string(),
  icon: z.string(),
  amount: z.number(),
});

const BooksLibraryFileTypeSchema = z.object({
  name: z.string(),
  amount: z.number(),
});

const BooksLibraryDownloadProcessSchema = z.object({
  kill: z.function().output(z.void()),
  downloaded: z.string(),
  total: z.string(),
  percentage: z.string(),
  speed: z.string(),
  ETA: z.string(),
  metadata: z.any(),
});

const BooksLibraryLibgenSearchResultSchema = z.object({
  query: z.string(),
  resultsCount: z.string(),
  data: z.record(z.string(), z.any()),
  page: z.number(),
});

type IBooksLibraryEntry = z.infer<typeof BooksLibraryEntrySchema>;
type IBooksLibraryCollection = z.infer<typeof BooksLibraryCollectionSchema>;
type IBooksLibraryLanguage = z.infer<typeof BooksLibraryLanguageSchema>;
type IBooksLibraryFileType = z.infer<typeof BooksLibraryFileTypeSchema>;
type IBooksLibraryDownloadProcess = Omit<
  z.infer<typeof BooksLibraryDownloadProcessSchema>,
  "kill"
> & {
  kill: () => void;
};
type IBooksLibraryLibgenSearchResult = z.infer<
  typeof BooksLibraryLibgenSearchResultSchema
>;

export {
  BooksLibraryCollectionSchema,
  BooksLibraryDownloadProcessSchema,
  BooksLibraryEntrySchema,
  BooksLibraryFileTypeSchema,
  BooksLibraryLanguageSchema,
  BooksLibraryLibgenSearchResultSchema,
};

export type {
  IBooksLibraryCollection,
  IBooksLibraryDownloadProcess,
  IBooksLibraryEntry,
  IBooksLibraryFileType,
  IBooksLibraryLanguage,
  IBooksLibraryLibgenSearchResult,
};
