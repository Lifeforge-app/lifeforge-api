import { Request, Response } from "express";

import { BaseResponse } from "@typescript/base_response";

import { successWithBaseResponse } from "@utils/response";

import * as EntriesService from "../services/entries.service";
import { IMusicEntry } from "../typescript/music_interfaces";

export const getAllEntries = async (
  req: Request,
  res: Response<BaseResponse<IMusicEntry[]>>,
) => {
  const { pb } = req;
  const entries = await EntriesService.getAllEntries(pb);
  successWithBaseResponse(res, entries);
};

export const importMusicFromNAS = async (req, res) => {
  const { pb } = req;

  if (EntriesService.getImportProgress() === "in_progress") {
    res.status(400).json({ error: "Already importing" });
    return;
  }

  EntriesService.setImportProgress("in_progress");
  res.status(202).json({
    state: "accepted",
    message: "Download started",
  });

  await EntriesService.importMusicFromNAS(pb);
  EntriesService.setImportProgress("completed");
};

export const getImportStatus = async (
  _: Request,
  res: Response<
    BaseResponse<{ status: "in_progress" | "completed" | "failed" | "empty" }>
  >,
) => {
  const status = EntriesService.getImportProgress();
  successWithBaseResponse(res, { status });
};

export const updateEntry = async (
  req: Request,
  res: Response<BaseResponse<IMusicEntry>>,
) => {
  const { pb } = req;
  const { id } = req.params;
  const { name, author } = req.body;

  const entry = await EntriesService.updateEntry(pb, id, { name, author });
  successWithBaseResponse(res, entry);
};

export const deleteEntry = async (req, res) => {
  const { pb } = req;
  const { id } = req.params;

  await EntriesService.deleteEntry(pb, id);
  successWithBaseResponse(res);
};

export const toggleFavorite = async (
  req: Request,
  res: Response<BaseResponse<IMusicEntry>>,
) => {
  const { pb } = req;
  const { id } = req.params;

  const entry = await EntriesService.toggleFavorite(pb, id);
  successWithBaseResponse(res, entry);
};
