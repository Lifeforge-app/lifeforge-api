import { BasePBCollectionSchema } from "@typescript/pocketbase_interfaces";
import * as s from "superstruct";

const VirtualWardrobeEntrySchema = s.assign(
  BasePBCollectionSchema,
  s.object({
    name: s.string(),
    category: s.string(),
    subcategory: s.string(),
    brand: s.string(),
    size: s.string(),
    colors: s.array(s.string()),
    price: s.number(),
    notes: s.string(),
    front_image: s.string(),
    back_image: s.string(),
    is_favourite: s.boolean(),
  }),
);

const VirtualWardrobeHistorySchema = s.object({
  entries: s.array(s.string()),
});

type IVirtualWardrobeEntry = s.Infer<typeof VirtualWardrobeEntrySchema>;
type IVirtualWardrobeHistory = s.Infer<typeof VirtualWardrobeHistorySchema>;

export { VirtualWardrobeEntrySchema, VirtualWardrobeHistorySchema };
export type { IVirtualWardrobeEntry, IVirtualWardrobeHistory };
