import express from "express";

import { uploadMiddleware } from "@middlewares/uploadMiddleware";

import * as EntriesController from "../controllers/entries.controller";

const router = express.Router();

router.get("/sidebar-data", EntriesController.getSidebarData);

router.get("/", EntriesController.getEntries);

router.get("/random", EntriesController.getRandomEntry);

router.get("/process-status", EntriesController.getProcessStatus);

router.post("/upload", uploadMiddleware, EntriesController.uploadFiles);

router.post("/favourite/:id", EntriesController.toggleFavorite);

router.patch("/:id", EntriesController.updateEntry);

router.delete("/:id", EntriesController.deleteEntry);

export default router;
