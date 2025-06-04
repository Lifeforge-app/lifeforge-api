import express from "express";

import { singleUploadMiddleware } from "@middlewares/uploadMiddleware";

import * as EntriesController from "../controllers/entries.controller";

const router = express.Router();

router.get("/collection-id", EntriesController.getCollectionId);

router.get("/:id", EntriesController.getEntriesByListId);

router.post("/external", EntriesController.scrapeExternal);

router.post("/", singleUploadMiddleware, EntriesController.createEntry);

router.patch("/:id", singleUploadMiddleware, EntriesController.updateEntry);

router.patch("/bought/:id", EntriesController.updateEntryBoughtStatus);

router.delete("/:id", EntriesController.deleteEntry);

export default router;
