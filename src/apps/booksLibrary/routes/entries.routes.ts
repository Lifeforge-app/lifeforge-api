import express from "express";

import * as EntriesController from "../controllers/entries.controller";

const router = express.Router();

router.get("/", EntriesController.getAllEntries);

router.patch("/:id", EntriesController.updateEntry);

router.post("/favourite/:id", EntriesController.toggleFavouriteStatus);

router.post("/send-to-kindle/:id", EntriesController.sendToKindle);

router.delete("/:id", EntriesController.deleteEntry);

export default router;
