import { z } from "zod/v4";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import { forgeController } from "@utils/forgeController";

import * as sessionService from "../services/session.service";
import { VirtualWardrobeEntrySchema } from "../typescript/virtual_wardrobe_interfaces";

export const getCart = forgeController(
  {
    response: z.array(WithPBSchema(VirtualWardrobeEntrySchema)),
  },
  async () => sessionService.getSessionCart(),
);

export const addToCart = forgeController(
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

export const removeFromCart = forgeController(
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

export const checkout = forgeController(
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

export const clearCart = forgeController(
  {
    response: z.void(),
  },
  async () => {
    sessionService.clearCart();
  },
);
