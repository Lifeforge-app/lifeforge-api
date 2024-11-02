import express, { Request, Response } from "express";
import { successWithBaseResponse } from "../../../utils/response.js";
import asyncWrapper from "../../../utils/asyncWrapper.js";
import { list } from "../../../utils/CRUD.js";

const router = express.Router();

router.get(
  "/list",
  asyncWrapper(async (req, res) => list(req, res, "flashcards_tags"))
);

export default router;
