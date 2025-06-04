import express from "express";

import * as EntriesController from "../controllers/entries.controller";

const router = express.Router();

router.get("/challenge", EntriesController.getChallenge);

router.post("/decrypt/:id", EntriesController.decryptEntry);

router.get("/", EntriesController.getAllEntries);

router.post("/", EntriesController.createEntry);

router.patch("/:id", EntriesController.updateEntry);

router.delete("/:id", EntriesController.deleteEntry);

router.post("/pin/:id", EntriesController.togglePin);

export default router;
