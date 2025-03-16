import express from "express";
import asyncWrapper from "../../../utils/asyncWrapper";
import { list } from "../../../utils/CRUD";

const router = express.Router();

router.get(
  "/list",
  asyncWrapper(async (req, res) => list(req, res, "flashcards_tags")),
);

export default router;
