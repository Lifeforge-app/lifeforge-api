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

type IWishlistList = s.Infer<typeof WishlistListSchema>;

export { WishlistListSchema };
export type { IWishlistList };
