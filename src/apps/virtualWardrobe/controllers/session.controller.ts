import { z } from "zod/v4";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import { zodHandler } from "@utils/asyncWrapper";

import * as sessionService from "../services/session.service";
import { VirtualWardrobeEntrySchema } from "../typescript/virtual_wardrobe_interfaces";

export const getCart = zodHandler(
  {
    response: z.array(WithPBSchema(VirtualWardrobeEntrySchema)),
  },
  async () => sessionService.getSessionCart(),
);

export const addToCart = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  },
  async ({ pb, params: { id } }) => {
    await sessionService.addToCart(pb, id);
  },
  {
    existenceCheck: {
      params: {
        id: "virtual_wardrobe_entries",
      },
    },
  },
);

export const removeFromCart = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  },
  async ({ params: { id } }) => {
    sessionService.removeFromCart(id);
  },
  {
    existenceCheck: {
      params: {
        id: "virtual_wardrobe_entries",
      },
    },
  },
);

export const checkout = zodHandler(
  {
    body: z.object({
      notes: z.string(),
    }),
    response: z.void(),
  },
  async ({ pb, body: { notes } }) => {
    await sessionService.checkout(pb, notes);
  },
);

export const clearCart = zodHandler(
  {
    response: z.void(),
  },
  async () => {
    sessionService.clearCart();
  },
);
