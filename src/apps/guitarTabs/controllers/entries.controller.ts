import { z } from "zod";

import {
  PBListResultSchema,
  WithPBSchema,
} from "@typescript/pocketbase_interfaces";

import ClientError from "@utils/ClientError";
import { zodHandler } from "@utils/asyncWrapper";

import * as entriesService from "../services/entries.service";
import {
  GuitarTabsEntrySchema,
  GuitarTabsSidebarDataSchema,
} from "../typescript/guitar_tabs_interfaces";

export const getSidebarData = zodHandler(
  {
    response: GuitarTabsSidebarDataSchema,
  },
  async ({ pb }) => await entriesService.getSidebarData(pb),
);

export const getEntries = zodHandler(
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

export const getRandomEntry = zodHandler(
  {
    response: WithPBSchema(GuitarTabsEntrySchema),
  },
  async ({ pb }) => await entriesService.getRandomEntry(pb),
);

export const uploadFiles = zodHandler(
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

export const getProcessStatus = zodHandler(
  {
    response: z.any(),
  },
  async () => entriesService.getProcessStatus(),
);

export const updateEntry = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    body: z.object({
      name: z.string(),
      author: z.string(),
      type: z.string(),
    }),
    response: WithPBSchema(GuitarTabsEntrySchema),
  },
  async ({ pb, params, body }) =>
    await entriesService.updateEntry(
      pb,
      params.id,
      body.name,
      body.author,
      body.type,
    ),
  {
    existenceCheck: {
      params: {
        id: "guitar_tabs_entries",
      },
    },
  },
);

export const deleteEntry = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  },
  async ({ pb, params }) => await entriesService.deleteEntry(pb, params.id),
  {
    existenceCheck: {
      params: {
        id: "guitar_tabs_entries",
      },
    },
    statusCode: 204,
  },
);

export const toggleFavorite = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: WithPBSchema(GuitarTabsEntrySchema),
  },
  async ({ pb, params }) => await entriesService.toggleFavorite(pb, params.id),
  {
    existenceCheck: {
      params: {
        id: "guitar_tabs_entries",
      },
    },
  },
);
