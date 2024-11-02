import express, { Request, Response } from "express";
import { successWithBaseResponse } from "../../../utils/response.js";
import asyncWrapper from "../../../utils/asyncWrapper.js";
import { list, validate } from "../../../utils/CRUD.js";

const router = express.Router();

router.get(
  "/get/:id",
  asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { id } = req.params;

    const entries = await pb.collection("flashcards_decks").getOne(id);

    successWithBaseResponse(res, entries);
  })
);

router.get(
  "/valid/:id",
  asyncWrapper(async (req, res) => validate(req, res, "flashcards_decks"))
);

router.get(
  "/list",
  asyncWrapper(async (req, res) =>
    list(req, res, "flashcards_decks", {
      expand: "tag",
    })
  )
);

export default router;
