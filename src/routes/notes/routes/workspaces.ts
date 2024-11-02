import express, { Request, Response } from "express";
import { successWithBaseResponse } from "../../../utils/response.js";
import asyncWrapper from "../../../utils/asyncWrapper.js";
import { validate } from "../../../utils/CRUD.js";

const router = express.Router();

router.get(
  "/get/:id",
  asyncWrapper(async (req, res) => {
    const { pb } = req;
    const category = await pb
      .collection("notes_workspaces")
      .getOne(req.params.id);

    successWithBaseResponse(res, category);
  })
);

router.get(
  "/valid/:id",
  asyncWrapper(async (req, res) => validate(req, res, "notes_workspaces"))
);

router.get(
  "/list",
  asyncWrapper(async (req, res) => {
    const { pb } = req;
    const categories = await pb.collection("notes_workspaces").getFullList();

    successWithBaseResponse(res, categories);
  })
);

export default router;
