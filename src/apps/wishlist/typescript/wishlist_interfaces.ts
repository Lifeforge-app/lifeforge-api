import { z } from "zod";

const WishlistListSchema = z.object({
  color: z.string(),
  icon: z.string(),
  name: z.string(),
  description: z.string(),
});

const WishlistEntrySchema = z.object({
  name: z.string(),
  url: z.string(),
  price: z.number(),
  image: z.string(),
  list: z.string(),
  bought: z.boolean(),
});

type IWishlistList = z.infer<typeof WishlistListSchema>;
type IWishlistEntry = z.infer<typeof WishlistEntrySchema>;

export { WishlistEntrySchema, WishlistListSchema };
export type { IWishlistEntry, IWishlistList };
