import { z } from "zod";

import {
  PBListResultSchema,
  WithPBSchema,
} from "@typescript/pocketbase_interfaces";

import ClientError from "@utils/ClientError";
import { zodHandler } from "@utils/asyncWrapper";

import * as EntriesServices from "../services/entries.service";
import { MomentVaultEntrySchema } from "../typescript/moment_vault_interfaces";

export const getEntries = zodHandler(
  {
    query: z.object({
      page: z
        .string()
        .optional()
        .transform((val) => parseInt(val ?? "1", 10) || 1),
    }),
    response: PBListResultSchema(WithPBSchema(MomentVaultEntrySchema)),
  },
  async ({ pb, query }) => await EntriesServices.getAllEntries(pb, query.page),
);

export const createEntry = zodHandler(
  {
    body: z.object({
      type: z.enum(["text", "audio", "photos"]),
      content: z.string().optional(),
      transcription: z.string().optional(),
    }),
    response: WithPBSchema(MomentVaultEntrySchema),
  },
  async ({ pb, body: { type, content, transcription }, req }) => {
    if (type === "audio") {
      const { files } = req as { files: Express.Multer.File[] };

      if (!files?.length) {
        throw new ClientError("No file uploaded");
      }

      if (files.length > 1) {
        throw new ClientError("Only one audio file is allowed");
      }

      if (!files[0].mimetype.startsWith("audio/")) {
        throw new ClientError("File must be an audio file");
      }

      return await EntriesServices.createAudioEntry(pb, {
        file: files[0],
        transcription,
      });
    }

    if (type === "text") {
      if (!content) {
        throw new ClientError("Content is required for text entries");
      }

      return await EntriesServices.createTextEntry(pb, content);
    }

    if (type === "photos") {
      const { files } = req as { files: Express.Multer.File[] };

      if (!files?.length) {
        throw new ClientError("No files uploaded");
      }

      return await EntriesServices.createPhotosEntry(pb, files);
    }

    throw new ClientError("Invalid entry type");
  },
  {
    statusCode: 201,
  },
);

export const updateEntry = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    body: z.object({
      content: z.string(),
    }),
    response: WithPBSchema(MomentVaultEntrySchema),
  },
  async ({ pb, params: { id }, body: { content } }) =>
    await EntriesServices.updateEntry(pb, id, content),
  {
    existenceCheck: {
      params: {
        id: "moment_vault_entries",
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
  async ({ pb, params: { id } }) => await EntriesServices.deleteEntry(pb, id),
  {
    existenceCheck: {
      params: {
        id: "moment_vault_entries",
      },
    },
    statusCode: 204,
  },
);
