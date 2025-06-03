import express from "express";

import { uploadMiddleware } from "@middlewares/uploadMiddleware";

import * as entriesController from "../controllers/entries.controller";

const router = express.Router();

router.get("/sidebar-data", entriesController.getSidebarData);

router.get("/", entriesController.getEntries);

router.get("/random", entriesController.getRandomEntry);

router.get("/process-status", entriesController.getProcessStatus);

router.post("/upload", uploadMiddleware, entriesController.uploadFiles);

router.post("/favourite/:id", entriesController.toggleFavorite);

router.patch("/:id", entriesController.updateEntry);

router.delete("/:id", entriesController.deleteEntry);

export default router;
