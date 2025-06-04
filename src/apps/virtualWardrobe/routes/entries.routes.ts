import express from "express";
import { param } from "express-validator";

import { fieldsUploadMiddleware } from "@middlewares/uploadMiddleware";

import * as EntriesController from "../controllers/entries.controller";

const router = express.Router();

router.get("/sidebar-data", EntriesController.getSidebarData);

router.get("/", EntriesController.getEntries);

router.post(
  "/",
  fieldsUploadMiddleware.bind({
    fields: [
      { name: "backImage", maxCount: 1 },
      { name: "frontImage", maxCount: 1 },
    ],
  }),
  EntriesController.createEntry,
);

router.patch("/:id", EntriesController.updateEntry);

router.delete("/:id", EntriesController.deleteEntry);

router.post(
  "/vision",
  fieldsUploadMiddleware.bind({
    fields: [
      { name: "frontImage", maxCount: 1 },
      { name: "backImage", maxCount: 1 },
    ],
  }),
  EntriesController.analyzeVision,
);

export default router;
