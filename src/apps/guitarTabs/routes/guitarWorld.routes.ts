import express from "express";

import * as guitarWorldController from "../controllers/guitarWorld.controller";

const router = express.Router();

router.post("/", guitarWorldController.getTabsList);

router.post("/download", guitarWorldController.downloadTab);

export default router;
