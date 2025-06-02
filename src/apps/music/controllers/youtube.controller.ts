import { BaseResponse } from "@typescript/base_response";
import { clientError, successWithBaseResponse } from "@utils/response";
import { Request, Response } from "express";
import * as YoutubeService from "../services/youtube.service";
import { IYoutubeData } from "../typescript/music_interfaces";

export const getVideoInfo = async (
  req: Request,
  res: Response<BaseResponse<IYoutubeData>>,
) => {
  const { id } = req.params;

  if (!id.match(/^[a-zA-Z0-9_-]{11}$/)) {
    clientError(res, "Invalid video ID");
    return;
  }

  const videoData = await YoutubeService.getVideoInfo(id);
  successWithBaseResponse(res, videoData);
};

export const downloadVideo = async (req: Request, res: Response) => {
  const { pb } = req;
  const { id } = req.params;
  const { metadata } = req.body;

  if (YoutubeService.getDownloadStatus() === "in_progress") {
    clientError(res, "Already downloading");
    return;
  }

  YoutubeService.setDownloadStatus("in_progress");
  res.status(202).json({
    state: "accepted",
    message: "Download started",
  });

  YoutubeService.downloadVideo(pb, id, metadata);
};

export const getDownloadStatus = async (
  _: Request,
  res: Response<
    BaseResponse<{ status: "empty" | "in_progress" | "completed" | "failed" }>
  >,
) => {
  const status = YoutubeService.getDownloadStatus();
  successWithBaseResponse(res, { status });
};
