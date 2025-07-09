// This file is auto-generated. DO NOT EDIT IT MANUALLY.
// Generated for module: wishlist
// Generated at: 2025-07-09T11:52:26.855Z
// Contains: wishlist__lists, wishlist__entries, wishlist__lists_aggregated
import { z } from "zod/v4";

const WishlistListsSchema = z.object({
  name: z.string(),
  description: z.string(),
  color: z.string(),
  icon: z.string(),
});

const WishlistEntriesSchema = z.object({
  name: z.string(),
  url: z.string(),
  price: z.number(),
  image: z.string(),
  list: z.string(),
  bought: z.boolean(),
  bought_at: z.string(),
});

const WishlistListsAggregatedSchema = z.object({
  name: z.string(),
  description: z.string(),
  color: z.string(),
  icon: z.string(),
  total_count: z.number(),
  total_amount: z.any(),
  bought_count: z.number(),
  bought_amount: z.any(),
});

type IWishlistLists = z.infer<typeof WishlistListsSchema>;
type IWishlistEntries = z.infer<typeof WishlistEntriesSchema>;
type IWishlistListsAggregated = z.infer<typeof WishlistListsAggregatedSchema>;

export {
  WishlistListsSchema,
  WishlistEntriesSchema,
  WishlistListsAggregatedSchema,
};

export type { IWishlistLists, IWishlistEntries, IWishlistListsAggregated };
