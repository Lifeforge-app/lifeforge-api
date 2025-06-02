import { Request, Response } from "express";

import { BaseResponse } from "@typescript/base_response";

import { successWithBaseResponse } from "@utils/response";

import * as YoutubeSummarizerService from "../services/youtubeSummarizer.service";

export const getYoutubeVideoInfo = async (
  req: Request,
  res: Response<BaseResponse<IYoutubeInfo>>,
) => {
  const info = await YoutubeSummarizerService.getYoutubeVideoInfo(
    req.params.id,
  );

  successWithBaseResponse(res, info);
};

export const summarizeVideo = async (
  req: Request,
  res: Response<BaseResponse<string>>,
) => {
  const summary = await YoutubeSummarizerService.summarizeVideo(
    req.body.url,
    req.pb,
  );

  successWithBaseResponse(res, summary);
};
