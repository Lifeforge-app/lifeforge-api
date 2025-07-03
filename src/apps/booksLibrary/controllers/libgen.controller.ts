import {
  bulkRegisterControllers,
  forgeController,
} from "@functions/forgeController";
import express from "express";
import request from "request";
import { z } from "zod/v4";

import * as libgenService from "../services/libgen.service";
import {
  BooksLibraryDownloadProcessSchema,
  BooksLibraryEntrySchema,
  BooksLibraryLibgenSearchResultSchema,
} from "../typescript/books_library_interfaces";

const booksLibraryLibgenRouter = express.Router();

const getStatus = forgeController
  .route("GET /status")
  .description("Get libgen service status")
  .schema({
    response: z.boolean(),
  })
  .callback(libgenService.getStatus);

const searchBooks = forgeController
  .route("GET /search")
  .description("Search books in libgen")
  .schema({
    query: z.object({
      view: z.string(),
      req: z.string(),
      open: z.string(),
      res: z.string(),
      column: z.string(),
      page: z.string(),
      sort: z.string(),
      sortmode: z.string(),
    }),
    response: BooksLibraryLibgenSearchResultSchema,
  })
  .callback(async ({ query }) => await libgenService.searchBooks(query));

const getBookDetails = forgeController
  .route("GET /details/:md5")
  .description("Get book details from libgen")
  .schema({
    params: z.object({
      md5: z.string(),
    }),
    response: z.record(z.string(), z.any()),
  })
  .callback(
    async ({ params: { md5 } }) => await libgenService.getBookDetails(md5),
  );

const getLocalLibraryData = forgeController
  .route("GET /local-library-data/:md5")
  .description("Get local library data for a book")
  .schema({
    params: z.object({
      md5: z.string(),
    }),
    response: BooksLibraryEntrySchema.omit({
      collection: true,
      file: true,
      is_favourite: true,
      is_read: true,
      time_finished: true,
    }),
  })
  .callback(
    async ({ params: { md5 } }) => await libgenService.getLocalLibraryData(md5),
  );

const fetchCover = forgeController
  .route("GET /cover/:id/:name")
  .description("Fetch book cover from libgen")
  .schema({
    params: z.object({
      id: z.string(),
      name: z.string(),
    }),
    response: z.void(),
  })
  .noDefaultResponse()
  .callback(async ({ params: { id, name }, res }) => {
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

    request(`https://books.ms/covers/${id}/${name}`).pipe(res);
  });

const addToLibrary = forgeController
  .route("POST /add-to-library/:md5")
  .description("Add a book to the library from libgen")
  .schema({
    params: z.object({
      md5: z.string(),
    }),
    body: z.object({
      metadata: z.object({
        authors: z.string(),
        category: z.string(),
        extension: z.string(),
        isbn: z.string(),
        languages: z.array(z.string()),
        md5: z.string(),
        publisher: z.string(),
        size: z.string(),
        thumbnail: z.string(),
        title: z.string(),
        year_published: z.string(),
      }),
    }),
    response: z.void(),
  })
  .statusCode(202)
  .callback(
    async ({ pb, params: { md5 }, body: { metadata } }) =>
      await libgenService.initiateDownload(pb, md5, metadata),
  );

const getDownloadProgresses = forgeController
  .route("GET /download-progresses")
  .description("Get download progresses for all downloads")
  .schema({
    response: z.record(
      z.string(),
      BooksLibraryDownloadProcessSchema.omit({
        kill: true,
      }),
    ),
  })
  .callback(async () => libgenService.getDownloadProgresses());

const cancelDownload = forgeController
  .route("DELETE /download-progresses/:md5")
  .description("Cancel a download")
  .schema({
    params: z.object({
      md5: z.string(),
    }),
    response: z.void(),
  })
  .statusCode(204)
  .callback(async ({ params: { md5 } }) => libgenService.cancelDownload(md5));

bulkRegisterControllers(booksLibraryLibgenRouter, [
  getStatus,
  searchBooks,
  getBookDetails,
  getLocalLibraryData,
  fetchCover,
  addToLibrary,
  getDownloadProgresses,
  cancelDownload,
]);

export default booksLibraryLibgenRouter;
