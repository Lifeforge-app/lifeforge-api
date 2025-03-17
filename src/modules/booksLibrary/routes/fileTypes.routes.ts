import express from "express";
import asyncWrapper from "../../../core/utils/asyncWrapper";
import * as FileTypesController from "../controllers/fileTypes.controller";

const router = express.Router();

router.get("/", asyncWrapper(FileTypesController.getAllFileTypes));

export default router;
