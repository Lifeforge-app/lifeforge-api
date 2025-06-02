import { BaseResponse } from "@typescript/base_response";
import asyncWrapper from "@utils/asyncWrapper";
import {
  clientError,
  serverError,
  successWithBaseResponse,
} from "@utils/response";
import { exec } from "child_process";
import express, { Request, Response } from "express";
import { body, param } from "express-validator";
import fs from "fs";
import moment from "moment";
import downloadVideo from "../functions/downloadVideo";
// @ts-expect-error no types available
import getDimensions from "get-video-dimensions";
import path from "path";
import { IYoutubeData } from "../../music/typescript/music_interfaces";
import updateVideoChannelData from "../functions/updateVideoChannelData";
import { IYoutubeVidesStorageEntry } from "../typescript/youtube_video_storage_interfaces";

const VIDEO_STORAGE_PATH = `${process.cwd()}/../youtubeVideos`;

const router = express.Router();

const processes = new Map<
  string,
  {
    status: "in_progress" | "completed" | "failed";
    progress: number;
    metadata?: IYoutubeData;
  }
>();

router.get(
  "/thumbnail/:id",
  param("id")
    .isString()
    .matches(/^[a-zA-Z0-9_-]{11}$/),
  asyncWrapper(async (req, res) => {
    const { id } = req.params;

    if (!fs.existsSync(`${process.cwd()}/../youtubeVideos/${id}.webp`)) {
      clientError(res, "Thumbnail not found");
      return;
    }

    res.sendFile(path.join(process.cwd(), `../youtubeVideos/${id}.webp`));
  }),
);

router.get(
  "/stream/:id",
  param("id")
    .isString()
    .matches(/^[a-zA-Z0-9_-]{11}$/),
  asyncWrapper(async (req, res) => {
    const { id } = req.params;

    if (!fs.existsSync(`${process.cwd()}/../youtubeVideos/${id}.mp4`)) {
      clientError(res, "Video not found");
      return;
    }

    res.sendFile(path.join(process.cwd(), `../youtubeVideos/${id}.mp4`));
  }),
);

router.get(
  "",
  asyncWrapper(
    async (
      req: Request,
      res: Response<BaseResponse<IYoutubeVidesStorageEntry[]>>,
    ) => {
      const { pb } = req;

      const videos = await pb
        .collection("youtube_video_storage_entry")
        .getFullList<
          IYoutubeVidesStorageEntry & {
            expand?: {
              channel: {
                youtube_id: string;
                name: string;
                thumbnail: string;
              };
            };
          }
        >({
          sort: "-created",
          expand: "channel",
        });

      videos.forEach((video) => {
        const channel = video.expand?.channel;
        if (!channel) return;
        video.channel = {
          id: channel.youtube_id,
          name: channel.name,
          thumbnail: pb.files
            .getURL(channel, channel.thumbnail)
            .split("/files/")[1],
        };
      });

      successWithBaseResponse(res, videos as IYoutubeVidesStorageEntry[]);
    },
  ),
);

router.get(
  "/get-info/:id",
  asyncWrapper(async (req, res: Response<BaseResponse<IYoutubeData>>) => {
    const { id } = req.params;

    if (!id.match(/^[a-zA-Z0-9_-]{11}$/)) {
      clientError(res, "Invalid video ID");
      return;
    }

    exec(
      `${process.cwd()}/src/core/bin/yt-dlp --skip-download --print "title,upload_date,uploader,uploader_url,duration,view_count,like_count,thumbnail" "https://www.youtube.com/watch?v=${id}"`,
      (err, stdout) => {
        if (err) {
          serverError(
            res,
            err?.message ?? err?.message.includes("Video unavailable")
              ? "Video unavailable"
              : "An error occurred",
          );
          return;
        }

        const [
          title,
          uploadDate,
          uploader,
          uploaderUrl,
          duration,
          viewCount,
          likeCount,
          thumbnail,
        ] = stdout.split("\n");

        const response: IYoutubeData = {
          title,
          uploadDate,
          uploader,
          uploaderUrl,
          duration,
          viewCount: +viewCount,
          likeCount: +likeCount,
          thumbnail,
        };

        successWithBaseResponse(res, response);
      },
    );
  }),
);

router.post(
  "/async-download/:id",
  [
    body("metadata").isObject(),
    param("id")
      .isString()
      .matches(/^[a-zA-Z0-9_-]{11}$/),
  ],
  asyncWrapper(async (req, res) => {
    if (
      fs.existsSync(`${process.cwd()}/../youtubeVideos/${req.params.id}.mp4`)
    ) {
      clientError(res, "Video already downloaded");
      return;
    }

    const { pb } = req;
    const { id } = req.params;
    const { metadata } = req.body;

    if (processes.has(id) && processes.get(id)?.status === "in_progress") {
      clientError(res, "Download already in progress");
      return;
    }

    processes.forEach((value, key) => {
      if (value.status !== "in_progress") {
        processes.delete(key);
      }
    });

    processes.set(id, {
      status: "in_progress",
      progress: 0,
      metadata,
    });

    res.status(202).json({
      state: "accepted",
      message: "Download started",
    });

    const output = `./medium/${id}.%(ext)s`;

    await downloadVideo(
      `https://www.youtube.com/watch?v=${id}`,
      output,
      (prog) => {
        processes.set(id, {
          status: "in_progress",
          progress: prog,
          metadata,
        });
      },
    )
      .then(async () => {
        if (!fs.existsSync(VIDEO_STORAGE_PATH)) {
          fs.mkdirSync(VIDEO_STORAGE_PATH);
        }

        fs.renameSync(`./medium/${id}.mp4`, `${VIDEO_STORAGE_PATH}/${id}.mp4`);

        fs.renameSync(
          `./medium/${id}.webp`,
          `${VIDEO_STORAGE_PATH}/${id}.webp`,
        );

        const { width, height } = await getDimensions(
          `${VIDEO_STORAGE_PATH}/${id}.mp4`,
        );

        const fileSize = fs.statSync(`${VIDEO_STORAGE_PATH}/${id}.mp4`).size;

        await pb.collection("youtube_video_storage_entry").create({
          youtube_id: id,
          title: metadata.title,
          upload_date: moment(metadata.uploadDate, "YYYYMMDD").toDate(),
          uploader: metadata.uploader,
          duration: +metadata.duration,
          width,
          height,
          filesize: fileSize,
        });

        if (metadata.uploaderUrl) {
          await updateVideoChannelData(id, metadata.uploaderUrl, pb);
        }

        processes.set(id, {
          status: "completed",
          progress: 100,
          metadata,
        });
      })
      .catch(() => {
        processes.set(id, {
          status: "failed",
          progress: 0,
          metadata,
        });
      });
  }),
);

router.post(
  "/download-status",
  body("id").custom((id) => {
    return (
      id === "all" || id.every((i: string) => i.match(/^[a-zA-Z0-9_-]{11}$/))
    );
  }),
  asyncWrapper(
    async (
      req: Request,
      res: Response<
        BaseResponse<
          | {
              status: "in_progress" | "completed" | "failed";
              progress: number;
            }
          | Record<
              string,
              {
                status: "in_progress" | "completed" | "failed";
                progress: number;
              }
            >
        >
      >,
    ) => {
      const { id } = req.body;

      if (id === "all") {
        successWithBaseResponse(res, Object.fromEntries(processes));
        return;
      }

      const response = Object.entries(Object.fromEntries(processes)).filter(
        ([key]) => id.includes(key),
      );

      successWithBaseResponse(res, Object.fromEntries(response));
    },
  ),
);

router.delete(
  "/:id",
  param("id").isString(),
  asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { id } = req.params;

    const record = await pb.collection("youtube_video_storage_entry").getOne<
      Omit<IYoutubeVidesStorageEntry, "channel"> & {
        channel: string;
      }
    >(id);
    if (!record) {
      clientError(res, "Video not found");
      return;
    }

    fs.unlinkSync(`${process.cwd()}/../youtubeVideos/${record.youtube_id}.mp4`);
    fs.unlinkSync(
      `${process.cwd()}/../youtubeVideos/${record.youtube_id}.webp`,
    );

    const channel = record.channel;

    if (channel) {
      const { totalItems } = await pb
        .collection("youtube_video_storage_entry")
        .getList(1, 1, {
          filter: `channel = "${channel}"`,
        });

      if (totalItems === 1) {
        await pb.collection("youtube_video_storage_channel").delete(channel);
      }
    }

    await pb.collection("youtube_video_storage_entry").delete(id);

    successWithBaseResponse(res);
  }),
);

export default router;
