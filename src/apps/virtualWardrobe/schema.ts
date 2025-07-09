// This file is auto-generated. DO NOT EDIT IT MANUALLY.
// Generated for module: virtualWardrobe
// Generated at: 2025-07-09T11:52:26.852Z
// Contains: virtual_wardrobe__entries, virtual_wardrobe__histories
import { z } from "zod/v4";

const VirtualWardrobeEntriesSchema = z.object({
  name: z.string(),
  category: z.string(),
  subcategory: z.string(),
  colors: z.any(),
  size: z.string(),
  brand: z.string(),
  front_image: z.string(),
  back_image: z.string(),
  last_worn: z.string(),
  times_worn: z.number(),
  purchase_date: z.string(),
  price: z.number(),
  notes: z.string(),
  is_favourite: z.boolean(),
});

const VirtualWardrobeHistoriesSchema = z.object({
  entries: z.string(),
  notes: z.string(),
});

type IVirtualWardrobeEntries = z.infer<typeof VirtualWardrobeEntriesSchema>;
type IVirtualWardrobeHistories = z.infer<typeof VirtualWardrobeHistoriesSchema>;

export { VirtualWardrobeEntriesSchema, VirtualWardrobeHistoriesSchema };

export type { IVirtualWardrobeEntries, IVirtualWardrobeHistories };
