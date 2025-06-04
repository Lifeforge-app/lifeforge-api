import request from "request";
import { z } from "zod/v4";

import { forgeController } from "@utils/zodifiedHandler";

import * as libgenService from "../services/libgen.service";
import {
  BooksLibraryDownloadProcessSchema,
  BooksLibraryEntrySchema,
  BooksLibraryLibgenSearchResultSchema,
} from "../typescript/books_library_interfaces";

export const getStatus = forgeController(
  {
    response: z.boolean(),
  },
  libgenService.getStatus,
);

export const searchBooks = forgeController(
  {
    query: z.object({
      mode: z.string(),
      req: z.string(),
      open: z.string(),
      res: z.string(),
      column: z.string(),
      page: z.string(),
      sort: z.string(),
      sortmode: z.string(),
    }),
    response: BooksLibraryLibgenSearchResultSchema,
  },
  async ({ query }) => await libgenService.searchBooks(query),
);

export const getBookDetails = forgeController(
  {
    params: z.object({
      md5: z.string(),
    }),
    response: z.record(z.string(), z.any()),
  },
  async ({ params: { md5 } }) => await libgenService.getBookDetails(md5),
);

export const getLocalLibraryData = forgeController(
  {
    params: z.object({
      md5: z.string(),
    }),
    response: BooksLibraryEntrySchema.omit({
      category: true,
      file: true,
      is_favourite: true,
    }),
  },
  async ({ params: { md5 } }) => await libgenService.getLocalLibraryData(md5),
);

export const fetchCover = forgeController(
  {
    params: z.object({
      "0": z.string(),
    }),
    response: z.void(),
  },
  async ({ params, res }) => {
    request(`http://libgen.is/covers/${params[0]}`).pipe(res);
    return undefined;
  },
);

export const addToLibrary = forgeController(
  {
    params: z.object({
      md5: z.string(),
    }),
    body: z.object({
      metadata: BooksLibraryEntrySchema.omit({
        thumbnail: true,
        file: true,
      }).extend({
        thumbnail: z.instanceof(File),
        file: z.instanceof(File),
      }),
    }),
    response: z.void(),
  },
  async ({ pb, params: { md5 }, body: { metadata } }) =>
    await libgenService.initiateDownload(pb, md5, metadata),
  { statusCode: 202 },
);

export const getDownloadProgresses = forgeController(
  {
    response: z.record(
      z.string(),
      BooksLibraryDownloadProcessSchema.omit({
        kill: true,
      }),
    ),
  },
  async () => libgenService.getDownloadProgresses(),
);

export const cancelDownload = forgeController(
  {
    params: z.object({
      md5: z.string(),
    }),
    response: z.void(),
  },
  async ({ params: { md5 } }) => libgenService.cancelDownload(md5),
  { statusCode: 204 },
);
