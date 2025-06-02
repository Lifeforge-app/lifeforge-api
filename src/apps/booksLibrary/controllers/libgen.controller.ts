import request from "request";
import { z } from "zod";

import { zodHandler } from "@utils/asyncWrapper";
import { successWithBaseResponse } from "@utils/response";

import * as libgenService from "../services/libgen.service";
import {
  BooksLibraryDownloadProcessSchema,
  BooksLibraryEntrySchema,
  BooksLibraryLibgenSearchResultSchema,
} from "../typescript/books_library_interfaces";

export const getStatus = zodHandler(
  {
    response: z.boolean(),
  },
  async (req, res) => {
    const status = await libgenService.getStatus();
    successWithBaseResponse(res, status);
  },
);

export const searchBooks = zodHandler(
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
  async (req, res) => {
    const result = await libgenService.searchBooks(req.query);

    successWithBaseResponse(res, result);
  },
);

export const getBookDetails = zodHandler(
  {
    params: z.object({
      md5: z.string(),
    }),
    response: z.record(z.string(), z.any()),
  },
  async (req, res) => {
    const { md5 } = req.params;

    const bookDetails = await libgenService.getBookDetails(md5);

    successWithBaseResponse(res, bookDetails);
  },
);

export const getLocalLibraryData = zodHandler(
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
  async (req, res) => {
    const { md5 } = req.params;

    const libraryData = await libgenService.getLocalLibraryData(md5);

    successWithBaseResponse(res, libraryData);
  },
);

export const fetchCover = zodHandler(
  {
    params: z.object({
      "0": z.string(),
    }),
    response: z.void(),
  },
  async (req, res) => {
    request(`http://libgen.is/covers/${req.params[0]}`).pipe(res);
  },
);

export const addToLibrary = zodHandler(
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
  async (req, res) => {
    const { pb } = req;
    const { metadata } = req.body;
    const { md5 } = req.params;

    await libgenService.initiateDownload(pb, md5, metadata);

    successWithBaseResponse(res, undefined, 202);
  },
);

export const getDownloadProgresses = zodHandler(
  {
    response: z.record(
      z.string(),
      BooksLibraryDownloadProcessSchema.omit({
        kill: true,
      }),
    ),
  },
  async (req, res) => {
    const progresses = libgenService.getDownloadProgresses();

    successWithBaseResponse(res, progresses);
  },
);

export const cancelDownload = zodHandler(
  {
    params: z.object({
      md5: z.string(),
    }),
    response: z.void(),
  },
  async (req, res) => {
    const { md5 } = req.params;

    libgenService.cancelDownload(md5);

    successWithBaseResponse(res, undefined, 204);
  },
);
