import fs from "fs";
import { z } from "zod/v4";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import { forgeController } from "@utils/forgeController";

import * as entriesService from "../services/entries.service";
import { WishlistEntrySchema } from "../typescript/wishlist_interfaces";

export const getCollectionId = forgeController(
  {
    response: z.string(),
  },
  async ({ pb }) => await entriesService.getCollectionId(pb),
);

export const getEntriesByListId = forgeController(
  {
    params: z.object({
      id: z.string(),
    }),
    query: z.object({
      bought: z
        .string()
        .optional()
        .transform((val) => val === "true"),
    }),
    response: z.array(WithPBSchema(WishlistEntrySchema)),
  },
  async ({ pb, params: { id }, query: { bought } }) =>
    await entriesService.getEntriesByListId(pb, id, bought),
  {
    existenceCheck: {
      params: {
        id: "wishlist_lists",
      },
    },
  },
);

export const scrapeExternal = forgeController(
  {
    body: z.object({
      url: z.string(),
      provider: z.string(),
    }),
    response: z.any(),
  },
  async ({ pb, body: { url, provider } }) =>
    await entriesService.scrapeExternal(pb, provider, url),
);

export const createEntry = forgeController(
  {
    body: WishlistEntrySchema.pick({
      name: true,
      url: true,
      price: true,
      list: true,
    }),
    response: WithPBSchema(WishlistEntrySchema),
  },
  async ({ pb, body, req }) => {
    const { file } = req;

    let imageFile: File | undefined;

    if (file) {
      const fileBuffer = fs.readFileSync(file.path);
      imageFile = new File([fileBuffer], file.originalname);
      fs.unlinkSync(file.path);
    }

    const data = {
      ...body,
      bought: false,
      image: imageFile,
    };

    return await entriesService.createEntry(pb, data);
  },
  {
    existenceCheck: {
      body: {
        list: "wishlist_lists",
      },
    },
    statusCode: 201,
  },
);

export const updateEntry = forgeController(
  {
    params: z.object({
      id: z.string(),
    }),
    body: z.object({
      name: z.string(),
      url: z.string(),
      price: z.number(),
      list: z.string(),
      imageRemoved: z.string().optional(),
    }),
    response: z.union([
      WithPBSchema(WishlistEntrySchema),
      z.literal("removed"),
    ]),
  },
  async ({
    pb,
    params: { id },
    body: { list, name, url, price, imageRemoved },
    req,
  }) => {
    const { file } = req;
    let finalFile: null | File = null;

    if (imageRemoved === "true") {
      finalFile = null;
    }

    if (file) {
      const fileBuffer = fs.readFileSync(file.path);
      finalFile = new File([fileBuffer], file.originalname);
      fs.unlinkSync(file.path);
    }

    const oldEntry = await entriesService.getEntry(pb, id);

    const entry = await entriesService.updateEntry(pb, id, {
      list,
      name,
      url,
      price,
      ...(imageRemoved === "true" || finalFile ? { image: finalFile } : {}),
    });

    return oldEntry.list === list ? entry : "removed";
  },
  {
    existenceCheck: {
      params: {
        id: "wishlist_entries",
      },
      body: {
        list: "wishlist_lists",
      },
    },
  },
);

export const updateEntryBoughtStatus = forgeController(
  {
    params: z.object({
      id: z.string(),
    }),
    response: WithPBSchema(WishlistEntrySchema),
  },
  async ({ pb, params: { id } }) =>
    await entriesService.updateEntryBoughtStatus(pb, id),
  {
    existenceCheck: {
      params: {
        id: "wishlist_entries",
      },
    },
  },
);

export const deleteEntry = forgeController(
  {
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  },
  async ({ pb, params: { id } }) => await entriesService.deleteEntry(pb, id),
  {
    existenceCheck: {
      params: {
        id: "wishlist_entries",
      },
    },
    statusCode: 204,
  },
);
