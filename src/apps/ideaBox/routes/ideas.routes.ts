import express from "express";
import multer from "multer";

import * as ideasController from "../controllers/ideas.controller";

const router = express.Router();

router.get("/:container/*", ideasController.getIdeas);

router.post("/", multer().single("image") as any, ideasController.createIdea);

router.patch("/:id", ideasController.updateIdea);

router.delete("/:id", ideasController.deleteIdea);

router.post("/pin/:id", ideasController.pinIdea);

router.post("/archive/:id", ideasController.archiveIdea);

router.post("/move/:id", ideasController.moveIdea);

router.delete("/move/:id", ideasController.removeFromFolder);

export default router;
