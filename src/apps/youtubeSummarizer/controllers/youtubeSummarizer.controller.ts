import { successWithBaseResponse } from "@utils/response";
import { Request, Response } from "express";
import { BaseResponse } from "../../../core/typescript/base_response";
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
