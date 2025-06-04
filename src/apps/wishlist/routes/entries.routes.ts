import express from "express";

import { singleUploadMiddleware } from "@middlewares/uploadMiddleware";

import * as entriesController from "../controllers/entries.controller";

const router = express.Router();

router.get("/collection-id", entriesController.getCollectionId);

router.get("/:id", entriesController.getEntriesByListId);

router.post("/external", entriesController.scrapeExternal);

router.post("/", singleUploadMiddleware, entriesController.createEntry);

router.patch("/:id", singleUploadMiddleware, entriesController.updateEntry);

router.patch("/bought/:id", entriesController.updateEntryBoughtStatus);

router.delete("/:id", entriesController.deleteEntry);

export default router;
