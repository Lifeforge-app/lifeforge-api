import express from "express";

import asyncWrapper from "@utils/asyncWrapper";

import * as libgenController from "../controllers/libgen.controller";

const router = express.Router();

router.get("/status", asyncWrapper(libgenController.getStatus));

router.get("/search", asyncWrapper(libgenController.searchBooks));

router.get("/covers/*", asyncWrapper(libgenController.fetchCover));

router.get("/details/:md5", asyncWrapper(libgenController.getBookDetails));

router.get(
  "/local-library-data/:md5",
  asyncWrapper(libgenController.getLocalLibraryData),
);

router.post(
  "/add-to-library/:md5",
  asyncWrapper(libgenController.addToLibrary),
);

router.get(
  "/download-progresses",
  asyncWrapper(libgenController.getDownloadProgresses),
);

router.delete(
  "/download-progresses/:md5",
  asyncWrapper(libgenController.cancelDownload),
);

export default router;
