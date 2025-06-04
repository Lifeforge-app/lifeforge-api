import express from "express";

import * as EntriesController from "../controllers/entries.controller";

const router = express.Router();

router.get("/", EntriesController.getAllEntries);

router.get("/status-counter", EntriesController.getStatusCounter);

router.get("/:id", EntriesController.getEntryById);

router.post("/", EntriesController.createEntry);

router.patch("/:id", EntriesController.updateEntry);

router.delete("/:id", EntriesController.deleteEntry);

router.post("/toggle/:id", EntriesController.toggleEntry);

export default router;
