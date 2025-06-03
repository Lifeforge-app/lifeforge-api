import express from "express";

import * as miscController from "../controllers/misc.controller";

const router = express.Router();

router.get("/path/:container/*", miscController.getPath);

router.get("/valid/:container/*", miscController.checkValid);

router.get("/og-data/:id", miscController.getOgData);

router.get("/search", miscController.search);

export default router;
