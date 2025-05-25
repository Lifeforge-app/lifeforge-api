import { getAPIKey } from "@utils/getAPIKey";
import { checkExistence } from "@utils/PBRecordValidator";
import { clientError, successWithBaseResponse } from "@utils/response";
import { Request, Response } from "express";
import { BaseResponse } from "../../../core/typescript/base_response";
import * as EntriesService from "../services/entries.service";
import { IBooksLibraryEntry } from "../typescript/books_library_interfaces";

export const getAllEntries = async (
  req: Request,
  res: Response<BaseResponse<IBooksLibraryEntry[]>>,
) => {
  const { pb } = req;
  const entries = await EntriesService.getAllEntries(pb);
  successWithBaseResponse(res, entries);
};

export const updateEntry = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<IBooksLibraryEntry>>,
) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "books_library_entries", id))) {
    return;
  }

  const data = req.body as Partial<IBooksLibraryEntry>;

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
  successWithBaseResponse(res, entry);
};

export const toggleFavouriteStatus = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<IBooksLibraryEntry>>,
) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "books_library_entries", id))) {
    return;
  }

  const entry = await EntriesService.toggleFavouriteStatus(pb, id);
  successWithBaseResponse(res, entry);
};

export const sendToKindle = async (
  req: Request<{ id: string }, undefined, { target: string }>,
  res: Response<BaseResponse<undefined>>,
) => {
  const { pb } = req;
  const { id } = req.params;
  const { target } = req.body;

  if (!(await checkExistence(req, res, "books_library_entries", id))) {
    return;
  }

  const smtpUser = await getAPIKey("smtp-user", pb);
  const smtpPassword = await getAPIKey("smtp-pass", pb);
  if (!smtpUser || !smtpPassword) {
    return clientError(
      res,
      "SMTP user or password not found. Please set them in the API Keys module.",
    );
  }

  await EntriesService.sendToKindle(
    pb,
    id,
    {
      user: smtpUser,
      pass: smtpPassword,
    },
    target,
  );

  successWithBaseResponse(res);
};

export const deleteEntry = async (
  req: Request<{ id: string }>,
  res: Response<BaseResponse<undefined>>,
) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "books_library_entries", id))) {
    return;
  }

  await EntriesService.deleteEntry(pb, id);
  successWithBaseResponse(res, undefined, 204);
};
