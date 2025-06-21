import { forgeController } from "@functions/forgeController";
import { z } from "zod/v4";

import * as YoutubeService from "../services/youtube.service";
import { YoutubeDataSchema } from "../typescript/music_interfaces";

export const getVideoInfo = forgeController(
  {
    params: z.object({
      id: z.string().regex(/^[a-zA-Z0-9_-]{11}$/, "Invalid YouTube video ID"),
    }),
    response: YoutubeDataSchema,
  },
  async ({ params: { id } }) => await YoutubeService.getVideoInfo(id),
);

export const downloadVideo = forgeController(
  {
    params: z.object({
      id: z.string().regex(/^[a-zA-Z0-9_-]{11}$/, "Invalid YouTube video ID"),
    }),
    body: z.object({
      title: z.string(),
      uploader: z.string(),
      duration: z.number(),
    }),
    response: z.boolean(),
  },
  async ({ pb, params: { id }, body }) => {
    if (YoutubeService.getDownloadStatus().status === "in_progress") {
      throw new Error("A download is already in progress");
    }

    YoutubeService.setDownloadStatus("in_progress");
    YoutubeService.downloadVideo(pb, id, body);

    return true;
  },
  {
    statusCode: 202,
  },
);

export const getDownloadStatus = forgeController(
  {
    response: z.object({
      status: z.enum(["empty", "in_progress", "completed", "failed"]),
    }),
  },
  async () => YoutubeService.getDownloadStatus(),
);
