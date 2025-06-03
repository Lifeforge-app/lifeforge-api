import express from "express";

import * as foldersController from "../controllers/folders.controller";

const router = express.Router();

router.get("/:container/*", foldersController.getFolders);

router.post("/", foldersController.createFolder);

router.patch("/:id", foldersController.updateFolder);

router.post("/move/:id", foldersController.moveFolder);

router.delete("/move/:id", foldersController.removeFromFolder);

router.delete("/:id", foldersController.deleteFolder);

export default router;
