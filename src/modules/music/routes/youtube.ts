import express, { Request, Response } from "express";
import { exec, spawn } from "child_process";
import { v4 } from "uuid";
import { readFileSync, readdirSync, unlinkSync } from "fs";
import asyncWrapper from "../../../utils/asyncWrapper";
import {
  clientError,
  serverError,
  successWithBaseResponse,
} from "../../../utils/response";
import { IYoutubeData } from "../../../interfaces/music_interfaces";
import { BaseResponse } from "../../../interfaces/base_response";
import { body, param } from "express-validator";
import hasError from "../../../utils/checkError";

const router = express.Router();

let downloading: "empty" | "in_progress" | "completed" | "failed" = "empty";

router.get(
  "/get-info/:id",
  asyncWrapper(async (req, res: Response<BaseResponse<IYoutubeData>>) => {
    const { id } = req.params;

    if (!id.match(/^[a-zA-Z0-9_-]{11}$/)) {
      clientError(res, "Invalid video ID");
      return;
    }

    exec(
      `${process.cwd()}/src/bin/yt-dlp --skip-download --print "title,upload_date,uploader,duration,view_count,like_count,thumbnail" "https://www.youtube.com/watch?v=${id}"`,
      (err, stdout) => {
        if (err) {
          serverError(res, err?.message ?? "Internal server error");
          return;
        }

        const [
          title,
          uploadDate,
          uploader,
          duration,
          viewCount,
          likeCount,
          thumbnail,
        ] = stdout.split("\n");

        const response: IYoutubeData = {
          title,
          uploadDate,
          uploader,
          duration,
          viewCount: +viewCount,
          likeCount: +likeCount,
          thumbnail,
        };

        successWithBaseResponse(res, response);
      }
    );
  })
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
    const { pb } = req;
    const { id } = req.params;
    const { metadata } = req.body;

    if (downloading === "in_progress") {
      clientError(res, "Already downloading");
      return;
    }

    downloading = "in_progress";
    res.status(202).json({
      state: "accepted",
      message: "Download started",
    });
    const downloadID = v4();

    exec(
      `${process.cwd()}/src/bin/yt-dlp -f bestaudio -o "${process.cwd()}/medium/${downloadID}-%(title)s.%(ext)s" --extract-audio --audio-format mp3 --audio-quality 0 "https://www.youtube.com/watch?v=${id}"`,
      async (err) => {
        if (err) {
          downloading = "failed";
          return;
        }

        const allFiles = readdirSync(`${process.cwd()}/medium`);
        const mp3File = allFiles.find((file) => file.startsWith(downloadID));
        if (!mp3File) {
          downloading = "failed";
          return;
        }

        const fileBuffer = readFileSync(`${process.cwd()}/medium/${mp3File}`);

        await pb.collection("music_entries").create({
          name: metadata.title,
          author: metadata.uploader,
          duration: metadata.duration,
          file: new File([fileBuffer], mp3File.split("-").slice(1).join("-")),
        });

        unlinkSync(`${process.cwd()}/medium/${mp3File}`);

        downloading = "completed";
      }
    );
  })
);

router.get(
  "/download-status",
  asyncWrapper(
    async (
      _: Request,
      res: Response<
        BaseResponse<{
          status: "empty" | "in_progress" | "completed" | "failed";
        }>
      >
    ) => {
      successWithBaseResponse(res, { status: downloading });
    }
  )
);

export default router;
