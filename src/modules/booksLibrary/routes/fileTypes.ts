import express from "express";
import * as FileTypesController from "../controllers/fileTypesController";

const router = express.Router();

/**
 * @protected
 * @summary Get a list of all book file types
 * @description Retrieve a list of all book file types.
 * @response 200 (IBooksLibraryFileType[]) - The list of book file types
 */
router.get("/", FileTypesController.getAllFileTypes);

export default router;
