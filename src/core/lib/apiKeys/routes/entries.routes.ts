import express from "express";

import * as entriesController from "../controllers/entries.controller";

const router = express.Router();

router.get("/", entriesController.getAllEntries);

router.get("/check", entriesController.checkKeys);

router.get("/:id", entriesController.getEntryById);

router.post("/", entriesController.createEntry);

router.patch("/:id", entriesController.updateEntry);

router.delete("/:id", entriesController.deleteEntry);

export default router;
