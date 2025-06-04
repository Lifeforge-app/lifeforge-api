import { z } from "zod";

import { zodHandler } from "@utils/asyncWrapper";

import * as YoutubeSummarizerService from "../services/youtubeSummarizer.service";
import { YoutubeInfoSchema } from "../typescript/youtube_summarizer_interfaces";

export const getYoutubeVideoInfo = zodHandler(
  {
    params: z.object({
      id: z.string().regex(/^[a-zA-Z0-9_-]{11}$/, "Invalid YouTube video ID"),
    }),
    response: YoutubeInfoSchema,
  },
  async ({ params: { id } }) =>
    await YoutubeSummarizerService.getYoutubeVideoInfo(id),
);

export const summarizeVideo = zodHandler(
  {
    body: z.object({
      url: z.string().url("Invalid URL"),
    }),
    response: z.string(),
  },
  ({ body: { url }, pb }) => YoutubeSummarizerService.summarizeVideo(url, pb),
);
