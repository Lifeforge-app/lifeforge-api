import express from "express";

import { uploadMiddleware } from "@middlewares/uploadMiddleware";

import * as EntriesController from "../controllers/entries.controller";

const router = express.Router();

router.get("/", EntriesController.getEntries);

router.post("/", uploadMiddleware, EntriesController.createEntry);

router.patch("/:id", EntriesController.updateEntry);

router.delete("/:id", EntriesController.deleteEntry);

export default router;
