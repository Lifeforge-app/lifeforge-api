import { z } from "zod/v4";

import {
  PBListResultSchema,
  WithPBSchema,
} from "@typescript/pocketbase_interfaces";

import ClientError from "@utils/ClientError";
import { forgeController } from "@utils/forgeController";

import * as entriesService from "../services/entries.service";
import {
  GuitarTabsEntrySchema,
  GuitarTabsSidebarDataSchema,
} from "../typescript/guitar_tabs_interfaces";

export const getSidebarData = forgeController(
  {
    response: GuitarTabsSidebarDataSchema,
  },
  async ({ pb }) => await entriesService.getSidebarData(pb),
);

export const getEntries = forgeController(
  {
    query: z.object({
      page: z
        .string()
        .optional()
        .transform((val) => parseInt(val ?? "1", 10) || 1),
      query: z.string().optional(),
      category: z.string().optional(),
      author: z.string().optional(),
      starred: z
        .string()
        .optional()
        .transform((val) => val === "true"),
      sort: z
        .enum(["name", "author", "newest", "oldest"])
        .optional()
        .default("newest"),
    }),
    response: PBListResultSchema(WithPBSchema(GuitarTabsEntrySchema)),
  },
  async ({ pb, query }) => await entriesService.getEntries(pb, query),
);

export const getRandomEntry = forgeController(
  {
    response: WithPBSchema(GuitarTabsEntrySchema),
  },
  async ({ pb }) => await entriesService.getRandomEntry(pb),
);

export const uploadFiles = forgeController(
  {
    response: z.boolean(),
  },
  async ({ pb, req }) => {
    const files = req.files;

    if (!files) {
      throw new ClientError("No files provided");
    }

    const result = await entriesService.uploadFiles(
      pb,
      files as Express.Multer.File[],
    );

    if (result.status === "error") {
      throw new Error(result.message);
    }

    return true;
  },
  {
    statusCode: 202,
  },
);

export const getProcessStatus = forgeController(
  {
    response: z.any(),
  },
  async () => entriesService.getProcessStatus(),
);

export const updateEntry = forgeController(
  {
    params: z.object({
      id: z.string(),
    }),
    body: GuitarTabsEntrySchema.pick({
      name: true,
      author: true,
      type: true,
    }),
    response: WithPBSchema(GuitarTabsEntrySchema),
  },
  async ({ pb, params: { id }, body }) =>
    await entriesService.updateEntry(pb, id, body),
  {
    existenceCheck: {
      params: {
        id: "guitar_tabs_entries",
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
        id: "guitar_tabs_entries",
      },
    },
    statusCode: 204,
  },
);

export const toggleFavorite = forgeController(
  {
    params: z.object({
      id: z.string(),
    }),
    response: WithPBSchema(GuitarTabsEntrySchema),
  },
  async ({ pb, params: { id } }) => await entriesService.toggleFavorite(pb, id),
  {
    existenceCheck: {
      params: {
        id: "guitar_tabs_entries",
      },
    },
  },
);
