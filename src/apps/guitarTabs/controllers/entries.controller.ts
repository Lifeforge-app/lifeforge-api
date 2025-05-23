import { checkExistence } from "@utils/PBRecordValidator";
import { clientError, successWithBaseResponse } from "@utils/response";
import { Request, Response } from "express";
import { BaseResponse } from "../../../core/typescript/base_response";
import * as entriesService from "../services/entries.service";
import {
  IGuitarTabsEntry,
  IGuitarTabsSidebarData,
} from "../typescript/guitar_tabs_interfaces";

export const getSidebarData = async (
  req: Request,
  res: Response<BaseResponse<IGuitarTabsSidebarData>>,
) => {
  const data = await entriesService.getSidebarData(req.pb);
  successWithBaseResponse(res, data);
};

export const getEntries = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const search = decodeURIComponent((req.query.query as string) || "");
  const category =
    req.query.category === "all" ? "" : (req.query.category as string);
  const author = req.query.author === "all" ? "" : (req.query.author as string);
  const starred = req.query.starred === "true";
  const sort = req.query.sort as string;

  const entries = await entriesService.getEntries(
    req.pb,
    page,
    search,
    category,
    author,
    starred,
    sort,
  );

  successWithBaseResponse(res, entries);
};

export const getRandomEntry = async (
  req: Request,
  res: Response<BaseResponse<IGuitarTabsEntry>>,
) => {
  const entry = await entriesService.getRandomEntry(req.pb);
  successWithBaseResponse(res, entry);
};

export const uploadFiles = async (
  req: Request,
  res: Response<BaseResponse>,
) => {
  const files = req.files;

  if (!files) {
    clientError(res, "No files provided");
    return;
  }

  const result = await entriesService.uploadFiles(
    req.pb,
    files as Express.Multer.File[],
  );

  if (result.status === "error") {
    throw new Error(result.message);
  }

  res.status(202).json({
    state: "accepted",
    message: "Processing started",
  });
};

export const getProcessStatus = async (
  _: Request,
  res: Response<
    BaseResponse<{
      status: string;
      left: number;
      total: number;
    }>
  >,
) => {
  const status = entriesService.getProcessStatus();
  successWithBaseResponse(res, status);
};

export const updateEntry = async (
  req: Request,
  res: Response<BaseResponse<IGuitarTabsEntry>>,
) => {
  const { id } = req.params;
  const { name, author, type } = req.body;

  if (!(await checkExistence(req, res, "guitar_tabs_entries", id))) {
    return;
  }

  const updatedEntry = await entriesService.updateEntry(
    req.pb,
    id,
    name,
    author,
    type,
  );
  successWithBaseResponse(res, updatedEntry);
};

export const deleteEntry = async (
  req: Request,
  res: Response<BaseResponse>,
) => {
  const { id } = req.params;

  await entriesService.deleteEntry(req.pb, id);
  successWithBaseResponse(res, undefined, 204);
};

export const downloadAllEntries = async (req: Request, res: Response) => {
  await entriesService.downloadAllEntries(req.pb);
  successWithBaseResponse(res);
};

export const toggleFavorite = async (
  req: Request,
  res: Response<BaseResponse<IGuitarTabsEntry>>,
) => {
  const { id } = req.params;

  if (!(await checkExistence(req, res, "guitar_tabs_entries", id))) {
    return;
  }

  const updatedEntry = await entriesService.toggleFavorite(req.pb, id);
  successWithBaseResponse(res, updatedEntry);
};
