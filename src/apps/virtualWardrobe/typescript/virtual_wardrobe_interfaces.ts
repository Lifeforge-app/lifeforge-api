import { z } from "zod";

const VirtualWardrobeEntrySchema = z.object({
  name: z.string(),
  category: z.string(),
  subcategory: z.string(),
  brand: z.string(),
  size: z.string(),
  colors: z.array(z.string()),
  price: z.number(),
  notes: z.string(),
  front_image: z.string(),
  back_image: z.string(),
  is_favourite: z.boolean(),
  times_worn: z.number().optional(),
  last_worn: z.string().optional(),
});

const VirtualWardrobeHistorySchema = z.object({
  entries: z.array(z.string()),
  notes: z.string(),
});

const VirtualWardrobeSidebarDataSchema = z.object({
  total: z.number(),
  favourites: z.number(),
  categories: z.record(z.string(), z.number()),
  subcategories: z.record(z.string(), z.number()),
  brands: z.record(z.string(), z.number()),
  sizes: z.record(z.string(), z.number()),
  colors: z.record(z.string(), z.number()),
});

type IVirtualWardrobeEntry = z.infer<typeof VirtualWardrobeEntrySchema>;
type IVirtualWardrobeHistory = z.infer<typeof VirtualWardrobeHistorySchema>;
type IVirtualWardrobeSidebarData = z.infer<
  typeof VirtualWardrobeSidebarDataSchema
>;

export {
  VirtualWardrobeEntrySchema,
  VirtualWardrobeHistorySchema,
  VirtualWardrobeSidebarDataSchema,
};
export type {
  IVirtualWardrobeEntry,
  IVirtualWardrobeHistory,
  IVirtualWardrobeSidebarData,
};
