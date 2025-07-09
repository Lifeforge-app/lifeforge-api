// This file is auto-generated. DO NOT EDIT IT MANUALLY.
// Generated for module: guitarTabs
// Generated at: 2025-07-09T11:52:26.853Z
// Contains: guitar_tabs__entries, guitar_tabs__authors
import { z } from "zod/v4";

const GuitarTabsEntriesSchema = z.object({
  name: z.string(),
  type: z.enum(["fingerstyle", "singalong"]),
  pageCount: z.string(),
  thumbnail: z.string(),
  author: z.string(),
  pdf: z.string(),
  audio: z.string(),
  musescore: z.string(),
  isFavourite: z.boolean(),
});

const GuitarTabsAuthorsSchema = z.object({
  name: z.string(),
  amount: z.number(),
});

type IGuitarTabsEntries = z.infer<typeof GuitarTabsEntriesSchema>;
type IGuitarTabsAuthors = z.infer<typeof GuitarTabsAuthorsSchema>;

export { GuitarTabsEntriesSchema, GuitarTabsAuthorsSchema };

export type { IGuitarTabsEntries, IGuitarTabsAuthors };
