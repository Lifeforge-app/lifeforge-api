import { z } from "zod/v4";

const BasePBCollectionSchema = z.object({
  id: z.string(),
  created: z.string(),
  updated: z.string(),
  collectionId: z.string(),
  collectionName: z.string(),
});

const GuitarTabsEntrySchema = z.object({
  name: z.string(),
  author: z.string(),
  thumbnail: z.string(),
  pageCount: z.number(),
  pdf: z.string(),
  audio: z.string(),
  musescore: z.string(),
  type: z.enum(["fingerstyle", "singalong", ""]),
  isFavourite: z.boolean(),
});

const GuitarTabsAuthorsSchema = z.object({
  name: z.string(),
  amount: z.number(),
});

const GuitarTabsSidebarDataSchema = z.object({
  total: z.number(),
  favourites: z.number(),
  categories: z.object({
    fingerstyle: z.number(),
    singalong: z.number(),
    uncategorized: z.number(),
  }),
  authors: z.record(z.string(), z.number()),
});

const GuitarTabsGuitarWorldEntrySchema = z.object({
  id: z.string(),
  name: z.string(),
  subtitle: z.string(),
  category: z.string(),
  mainArtist: z.string(),
  uploader: z.string(),
  audioUrl: z.string(),
});

type IGuitarTabsEntry = z.infer<typeof GuitarTabsEntrySchema>;
type IGuitarTabsAuthors = z.infer<typeof GuitarTabsAuthorsSchema>;
type IGuitarTabsSidebarData = z.infer<typeof GuitarTabsSidebarDataSchema>;
type IGuitarTabsGuitarWorldEntry = z.infer<
  typeof GuitarTabsGuitarWorldEntrySchema
>;

export type {
  IGuitarTabsEntry,
  IGuitarTabsAuthors,
  IGuitarTabsSidebarData,
  IGuitarTabsGuitarWorldEntry,
};

export {
  GuitarTabsEntrySchema,
  GuitarTabsAuthorsSchema,
  GuitarTabsSidebarDataSchema,
  GuitarTabsGuitarWorldEntrySchema,
};
