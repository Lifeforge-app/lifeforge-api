import * as s from "superstruct";
import { BasePBCollectionSchema } from "./pocketbase_interfaces.js";

const WishlistListSchema = s.assign(
  BasePBCollectionSchema,
  s.object({
    color: s.string(),
    icon: s.string(),
    name: s.string(),
    description: s.string(),
    item_count: s.number(),
  })
);

const WishlistEntrySchema = s.assign(
  BasePBCollectionSchema,
  s.object({
    name: s.string(),
    url: s.string(),
    price: s.number(),
    image: s.string(),
    list: s.string(),
  })
);

type IWishlistList = s.Infer<typeof WishlistListSchema>;
type IWishlistEntry = s.Infer<typeof WishlistEntrySchema>;

export { WishlistListSchema, WishlistEntrySchema };
export type { IWishlistList, IWishlistEntry };
