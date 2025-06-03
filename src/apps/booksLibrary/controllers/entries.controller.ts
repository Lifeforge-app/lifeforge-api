import { z } from "zod";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import ClientError from "@utils/ClientError";
import { zodHandler } from "@utils/asyncWrapper";
import { getAPIKey } from "@utils/getAPIKey";

import * as EntriesService from "../services/entries.service";
import { BooksLibraryEntrySchema } from "../typescript/books_library_interfaces";

export const getAllEntries = zodHandler(
  {
    response: z.array(WithPBSchema(BooksLibraryEntrySchema)),
  },
  ({ pb }) => EntriesService.getAllEntries(pb),
);

export const updateEntry = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    body: BooksLibraryEntrySchema.pick({
      title: true,
      authors: true,
      category: true,
      edition: true,
      languages: true,
      isbn: true,
      publisher: true,
      year_published: true,
    }),
    response: WithPBSchema(BooksLibraryEntrySchema),
  },
  ({ pb, params, body }) => EntriesService.updateEntry(pb, params.id, body),
  {
    existenceCheck: {
      params: {
        id: "books_library_entries",
      },
      body: {
        category: "[books_library_categories]",
        languages: "[books_library_languages]",
      },
    },
  },
);

export const toggleFavouriteStatus = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: WithPBSchema(BooksLibraryEntrySchema),
  },
  ({ pb, params }) => EntriesService.toggleFavouriteStatus(pb, params.id),
  {
    existenceCheck: {
      params: {
        id: "books_library_entries",
      },
    },
  },
);

export const sendToKindle = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    body: z.object({
      target: z.string().email().endsWith("@kindle.com"),
    }),
    response: z.void(),
  },
  async ({ pb, params, body }) => {
    const smtpUser = await getAPIKey("smtp-user", pb);
    const smtpPassword = await getAPIKey("smtp-pass", pb);

    if (!smtpUser || !smtpPassword) {
      throw new ClientError(
        "SMTP user or password not found. Please set them in the API Keys module.",
      );
    }

    return EntriesService.sendToKindle(
      pb,
      params.id,
      {
        user: smtpUser,
        pass: smtpPassword,
      },
      body.target,
    );
  },
  {
    existenceCheck: {
      params: {
        id: "books_library_entries",
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
  ({ pb, params }) => EntriesService.deleteEntry(pb, params.id),
  {
    existenceCheck: {
      params: {
        id: "books_library_entries",
      },
    },
    statusCode: 204,
  },
);
