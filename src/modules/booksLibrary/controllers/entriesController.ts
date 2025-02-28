import { Request, Response } from "express";
import * as EntriesService from "../services/entriesService";
import { IBooksLibraryEntry } from "../../../interfaces/books_library_interfaces";
import { BaseResponse } from "../../../interfaces/base_response";
import { clientError, successWithBaseResponse } from "../../../utils/response";
import { checkExistence } from "../../../utils/PBRecordValidator";

export const getAllEntries = async (
  req: Request,
  res: Response<BaseResponse<IBooksLibraryEntry[]>>
) => {
  const { pb } = req;

  const entries = await EntriesService.getAllEntries(pb);

  if (!entries) {
    clientError(res, "Failed to fetch entries");
    return;
  }

  successWithBaseResponse(res, entries);
};

export const updateEntry = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<IBooksLibraryEntry>>
) => {
  const { pb } = req;
  const { id } = req.params;
  const data = req.body as Partial<IBooksLibraryEntry>;

  if (!(await checkExistence(req, res, "books_library_entries", id))) {
    return;
  }

  if (
    data.category &&
    !(await checkExistence(req, res, "books_library_categories", data.category))
  ) {
    return;
  }

  if (data.languages) {
    for (const language of data.languages) {
      if (
        !(await checkExistence(req, res, "books_library_languages", language))
      ) {
        return;
      }
    }
  }

  const entry = await EntriesService.updateEntry(pb, id, data);

  if (!entry) {
    clientError(res, "Failed to update entry");
    return;
  }

  successWithBaseResponse(res, entry);
};

export const toggleFavouriteStatus = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<IBooksLibraryEntry>>
) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "books_library_entries", id))) {
    return;
  }

  const entry = await EntriesService.toggleFavouriteStatus(pb, id);

  if (!entry) {
    clientError(res, "Failed to toggle favourite status");
    return;
  }

  successWithBaseResponse(res, entry);
};

export const deleteEntry = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<undefined>>
) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "books_library_entries", id))) {
    return;
  }

  const isDeleted = await EntriesService.deleteEntry(pb, id);

  if (!isDeleted) {
    clientError(res, "Failed to delete entry");
    return;
  }

  successWithBaseResponse(res, undefined, 204);
};
