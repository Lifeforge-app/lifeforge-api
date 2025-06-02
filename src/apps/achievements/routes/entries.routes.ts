import express from "express";

import * as EntriesController from "../controllers/entries.controller";

const router = express.Router();

router.get("/:difficulty", EntriesController.getAllEntriesByDifficulty);

router.post("/", EntriesController.createEntry);

router.patch("/:id", EntriesController.updateEntry);

router.delete("/:id", EntriesController.deleteEntry);

export default router;
