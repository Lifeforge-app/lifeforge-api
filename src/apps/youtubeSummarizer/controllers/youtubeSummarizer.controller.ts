import { forgeController } from "@functions/forgeController";
import { z } from "zod/v4";

import * as YoutubeSummarizerService from "../services/youtubeSummarizer.service";
import { YoutubeInfoSchema } from "../typescript/youtube_summarizer_interfaces";

export const getYoutubeVideoInfo = forgeController(
  {
    params: z.object({
      id: z.string().regex(/^[a-zA-Z0-9_-]{11}$/, "Invalid YouTube video ID"),
    }),
    response: YoutubeInfoSchema,
  },
  async ({ params: { id } }) =>
    await YoutubeSummarizerService.getYoutubeVideoInfo(id),
);

export const summarizeVideo = forgeController(
  {
    body: z.object({
      url: z.string().url("Invalid URL"),
    }),
    response: z.string(),
  },
  ({ body: { url }, pb }) => YoutubeSummarizerService.summarizeVideo(url, pb),
);
