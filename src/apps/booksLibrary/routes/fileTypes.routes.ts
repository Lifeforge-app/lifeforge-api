import express from "express";

import * as FileTypesController from "../controllers/fileTypes.controller";

const router = express.Router();

router.get("/", FileTypesController.getAllFileTypes);

export default router;
