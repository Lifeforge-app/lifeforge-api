import express from "express";

import * as EntriesController from "../controllers/entries.controller";

const router = express.Router();

router.get("/", EntriesController.getAllEntries);

router.post("/:id", EntriesController.createEntryFromTMDB);

router.delete("/:id", EntriesController.deleteEntry);

router.patch("/watch-status/:id", EntriesController.toggleWatchStatus);

export default router;
