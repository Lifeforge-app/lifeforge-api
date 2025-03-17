import { checkExistence } from "@utils/PBRecordValidator";
import { serverError, successWithBaseResponse } from "@utils/response";
import { Request, Response } from "express";
import { BaseResponse } from "../../../core/typescript/base_response";
import * as entriesService from "../services/entries.service";
import { IMovieEntry } from "../typescript/movies_interfaces";

export const getAllEntries = async (
  req: Request,
  res: Response<BaseResponse<IMovieEntry[]>>,
) => {
  try {
    const { pb } = req;
    const entries = await entriesService.getAllEntries(pb);
    successWithBaseResponse(res, entries);
  } catch (error) {
    console.error(error);
    serverError(res, "Failed to fetch entries");
  }
};

export const createEntryFromTMDB = async (
  req: Request,
  res: Response<BaseResponse<IMovieEntry>>,
) => {
  try {
    const { id } = req.params;
    const { pb } = req;

    const newEntry = await entriesService.createEntryFromTMDB(pb, parseInt(id));
    successWithBaseResponse(res, newEntry);
  } catch (error) {
    console.error(error);
    serverError(res, "Failed to create entry from TMDB");
  }
};

export const deleteEntry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { pb } = req;

    if (!checkExistence(req, res, "movies_entries", id)) {
      return;
    }

    await entriesService.deleteEntry(pb, id);
    successWithBaseResponse(res, undefined, 204);
  } catch (error) {
    console.error(error);
    serverError(res, "Failed to delete entry");
  }
};
