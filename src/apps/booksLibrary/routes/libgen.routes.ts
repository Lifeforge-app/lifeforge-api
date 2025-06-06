import express from "express";

import * as libgenController from "../controllers/libgen.controller";

const router = express.Router();

router.get("/status", libgenController.getStatus);

router.get("/search", libgenController.searchBooks);

router.get("/cover/:id/:name", libgenController.fetchCover);

router.get("/details/:md5", libgenController.getBookDetails);

router.get("/local-library-data/:md5", libgenController.getLocalLibraryData);

router.post("/add-to-library/:md5", libgenController.addToLibrary);

router.get("/download-progresses", libgenController.getDownloadProgresses);

router.delete("/download-progresses/:md5", libgenController.cancelDownload);

export default router;
