/**
 * This file is auto-generated. DO NOT EDIT IT MANUALLY.
 * If you want to add custom schemas, you will find a dedicated space at the end of this file.
 * Generated for module: guitarTabs
 * Generated at: 2025-07-09T12:50:41.283Z
 * Contains: guitar_tabs__entries, guitar_tabs__authors_aggregated
 */
import { z } from "zod/v4";

const GuitarTabsEntrySchema = z.object({
  name: z.string(),
  type: z.enum(["fingerstyle", "singalong", ""]),
  pageCount: z.string(),
  thumbnail: z.string(),
  author: z.string(),
  pdf: z.string(),
  audio: z.string(),
  musescore: z.string(),
  isFavourite: z.boolean(),
});

const GuitarTabsAuthorAggregatedSchema = z.object({
  name: z.string(),
  amount: z.number(),
});

type IGuitarTabsEntry = z.infer<typeof GuitarTabsEntrySchema>;
type IGuitarTabsAuthorAggregated = z.infer<
  typeof GuitarTabsAuthorAggregatedSchema
>;

export { GuitarTabsEntrySchema, GuitarTabsAuthorAggregatedSchema };

export type { IGuitarTabsEntry, IGuitarTabsAuthorAggregated };

// -------------------- CUSTOM SCHEMAS --------------------

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
  id: z.number(),
  name: z.string(),
  subtitle: z.string(),
  category: z.string(),
  mainArtist: z.string(),
  uploader: z.string(),
  audioUrl: z.string(),
});

type IGuitarTabsSidebarData = z.infer<typeof GuitarTabsSidebarDataSchema>;
type IGuitarTabsGuitarWorldEntry = z.infer<
  typeof GuitarTabsGuitarWorldEntrySchema
>;

export { GuitarTabsSidebarDataSchema, GuitarTabsGuitarWorldEntrySchema };

export type { IGuitarTabsSidebarData, IGuitarTabsGuitarWorldEntry };
