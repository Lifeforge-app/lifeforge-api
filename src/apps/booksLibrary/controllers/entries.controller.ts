import { z } from "zod";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import { checkExistence } from "@utils/PBRecordValidator";
import { zodHandler } from "@utils/asyncWrapper";
import { getAPIKey } from "@utils/getAPIKey";
import { clientError, successWithBaseResponse } from "@utils/response";

import * as EntriesService from "../services/entries.service";
import { BooksLibraryEntrySchema } from "../typescript/books_library_interfaces";

export const getAllEntries = zodHandler(
  {
    response: z.array(WithPBSchema(BooksLibraryEntrySchema)),
  },
  async (req, res) => {
    const { pb } = req;
    const entries = await EntriesService.getAllEntries(pb);

    successWithBaseResponse(res, entries);
  },
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
  async (req, res) => {
    const { pb } = req;
    const { id } = req.params;
    const data = req.body;

    if (!(await checkExistence(req, res, "books_library_entries", id))) {
      return;
    }

    if (
      data.category &&
      !(await checkExistence(
        req,
        res,
        "books_library_categories",
        data.category,
      ))
    ) {
      return;
    }

    if (data.languages) {
      for (const language of data.languages) {
        if (
          !(await checkExistence(req, res, "books_library_languages", language))
        ) {
          return;
        }
      }
    }

    const entry = await EntriesService.updateEntry(pb, id, data);
    successWithBaseResponse(res, entry);
  },
);

export const toggleFavouriteStatus = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: WithPBSchema(BooksLibraryEntrySchema),
  },
  async (req, res) => {
    const { pb } = req;
    const { id } = req.params;

    if (!(await checkExistence(req, res, "books_library_entries", id))) {
      return;
    }

    const entry = await EntriesService.toggleFavouriteStatus(pb, id);

    successWithBaseResponse(res, entry);
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
  async (req, res) => {
    const { pb } = req;
    const { id } = req.params;
    const { target } = req.body;

    if (!(await checkExistence(req, res, "books_library_entries", id))) {
      return;
    }

    const smtpUser = await getAPIKey("smtp-user", pb);
    const smtpPassword = await getAPIKey("smtp-pass", pb);
    if (!smtpUser || !smtpPassword) {
      return clientError(
        res,
        "SMTP user or password not found. Please set them in the API Keys module.",
      );
    }

    await EntriesService.sendToKindle(
      pb,
      id,
      {
        user: smtpUser,
        pass: smtpPassword,
      },
      target,
    );

    successWithBaseResponse(res, undefined);
  },
);

export const deleteEntry = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  },
  async (req, res) => {
    const { pb } = req;
    const { id } = req.params;

    if (!(await checkExistence(req, res, "books_library_entries", id))) {
      return;
    }

    await EntriesService.deleteEntry(pb, id);

    successWithBaseResponse(res, undefined, 204);
  },
);
