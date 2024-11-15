import express, { Response } from "express";
import asyncWrapper from "../../../utils/asyncWrapper.js";
import { list } from "../../../utils/CRUD.js";
import { IBooksLibraryEntry } from "../../../interfaces/books_library_interfaces.js";
import { BaseResponse } from "../../../interfaces/base_response.js";
import { checkExistence } from "../../../utils/PBRecordValidator.js";
import { successWithBaseResponse } from "../../../utils/response.js";

const router = express.Router();

router.get(
  "/",
  asyncWrapper(async (req, res: Response<BaseResponse<IBooksLibraryEntry[]>>) =>
    list<IBooksLibraryEntry>(req, res, "books_library_entries", {
      sort: "-is_favourite,-created",
    })
  )
);

router.patch(
  "/:id",
  asyncWrapper(async (req, res: Response<BaseResponse<IBooksLibraryEntry>>) => {
    const { pb } = req;
    const { id } = req.params;
    const data = req.body;

    if (!(await checkExistence(req, res, "books_library_entries", id))) return;

    const entry: IBooksLibraryEntry = await pb
      .collection("books_library_entries")
      .update(id, data);

    successWithBaseResponse(res, entry);
  })
);

router.post(
  "/favourite/:id",
  asyncWrapper(async (req, res: Response<BaseResponse<IBooksLibraryEntry>>) => {
    const { pb } = req;
    const { id } = req.params;

    if (!(await checkExistence(req, res, "books_library_entries", id))) return;

    const book: IBooksLibraryEntry = await pb
      .collection("books_library_entries")
      .getOne(id);
    const entry: IBooksLibraryEntry = await pb
      .collection("books_library_entries")
      .update(id, {
        ...book,
        is_favourite: !book.is_favourite,
      });

    successWithBaseResponse(res, entry);
  })
);

router.delete(
  "/:id",
  asyncWrapper(async (req, res: Response<BaseResponse>) => {
    const { pb } = req;
    const { id } = req.params;

    if (!(await checkExistence(req, res, "books_library_entries", id))) return;

    await pb.collection("books_library_entries").delete(id);

    successWithBaseResponse(res, undefined, 204);
  })
);

export default router;
