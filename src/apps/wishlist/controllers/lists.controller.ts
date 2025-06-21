import { forgeController } from "@functions/forgeController";
import { z } from "zod/v4";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import * as listsService from "../services/lists.service";
import { WishlistListSchema } from "../typescript/wishlist_interfaces";

export const getList = forgeController(
  {
    params: z.object({
      id: z.string(),
    }),
    response: WithPBSchema(WishlistListSchema),
  },
  async ({ pb, params: { id } }) => await listsService.getList(pb, id),
  {
    existenceCheck: {
      params: {
        id: "wishlist_lists",
      },
    },
  },
);

export const checkListExists = forgeController(
  {
    params: z.object({
      id: z.string(),
    }),
    response: z.boolean(),
  },
  async ({ pb, params: { id } }) => await listsService.checkListExists(pb, id),
);

export const getAllLists = forgeController(
  {
    response: z.array(
      WithPBSchema(
        WishlistListSchema.extend({
          total_count: z.number(),
          bought_count: z.number(),
          total_amount: z.number(),
          bought_amount: z.number(),
        }),
      ),
    ),
  },
  async ({ pb }) => await listsService.getAllLists(pb),
);

export const createList = forgeController(
  {
    body: WishlistListSchema,
    response: WithPBSchema(WishlistListSchema),
  },
  async ({ pb, body }) => await listsService.createList(pb, body),
  {
    statusCode: 201,
  },
);

export const updateList = forgeController(
  {
    params: z.object({
      id: z.string(),
    }),
    body: WishlistListSchema,
    response: WithPBSchema(WishlistListSchema),
  },
  async ({ pb, params: { id }, body }) =>
    await listsService.updateList(pb, id, body),
  {
    existenceCheck: {
      params: {
        id: "wishlist_lists",
      },
    },
  },
);

export const deleteList = forgeController(
  {
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  },
  async ({ pb, params: { id } }) => await listsService.deleteList(pb, id),
  {
    existenceCheck: {
      params: {
        id: "wishlist_lists",
      },
    },
    statusCode: 204,
  },
);
