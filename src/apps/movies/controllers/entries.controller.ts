import { checkExistence } from "@utils/PBRecordValidator";
import { successWithBaseResponse } from "@utils/response";
import { Request, Response } from "express";
import { BaseResponse } from "../../../core/typescript/base_response";
import * as entriesService from "../services/entries.service";
import { IMovieEntry } from "../typescript/movies_interfaces";

export const getAllEntries = async (
  req: Request,
  res: Response<BaseResponse<IMovieEntry[]>>,
) => {
  const { pb } = req;

  const entries = await entriesService.getAllEntries(pb);
  successWithBaseResponse(res, entries);
};

export const createEntryFromTMDB = async (
  req: Request,
  res: Response<BaseResponse<IMovieEntry>>,
) => {
  const { id } = req.params;
  const { pb } = req;

  const newEntry = await entriesService.createEntryFromTMDB(pb, parseInt(id));
  successWithBaseResponse(res, newEntry);
};

export const deleteEntry = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { pb } = req;

  if (!(await checkExistence(req, res, "movies_entries", id))) {
    return;
  }

  await entriesService.deleteEntry(pb, id);
  successWithBaseResponse(res, undefined, 204);
};

export const toggleWatchStatus = async (
  req: Request,
  res: Response<BaseResponse<IMovieEntry>>,
) => {
  const { id } = req.params;
  const { pb } = req;

  if (!(await checkExistence(req, res, "movies_entries", id))) {
    return;
  }

  const entry = await entriesService.toggleWatchStatus(pb, id);
  successWithBaseResponse(res, entry);
};
