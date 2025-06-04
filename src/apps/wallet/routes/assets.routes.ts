import express from "express";

import * as AssetsController from "../controllers/assets.controller";

const router = express.Router();

router.get("/", AssetsController.getAllAssets);

router.post("/", AssetsController.createAsset);

router.patch("/:id", AssetsController.updateAsset);

router.delete("/:id", AssetsController.deleteAsset);

export default router;
