import * as s from "superstruct";

import { BasePBCollectionSchema } from "@typescript/pocketbase_interfaces";

const WishlistListSchema = s.assign(
  BasePBCollectionSchema,
  s.object({
    color: s.string(),
    icon: s.string(),
    name: s.string(),
    description: s.string(),
    item_count: s.number(),
  }),
);

const WishlistEntrySchema = s.assign(
  BasePBCollectionSchema,
  s.object({
    name: s.string(),
    url: s.string(),
    price: s.number(),
    image: s.string(),
    list: s.string(),
    bought: s.boolean(),
  }),
);

type IWishlistList = s.Infer<typeof WishlistListSchema>;
type IWishlistEntry = s.Infer<typeof WishlistEntrySchema>;

export { WishlistEntrySchema, WishlistListSchema };
export type { IWishlistEntry, IWishlistList };
