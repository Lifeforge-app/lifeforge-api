import express from "express";

import * as EntriesController from "../controllers/entries.controller";

const router = express.Router();

router.get("/", EntriesController.getAllEntries);

router.patch("/:id", EntriesController.updateEntry);

router.delete("/:id", EntriesController.deleteEntry);

router.post("/favourite/:id", EntriesController.toggleFavorite);

export default router;
