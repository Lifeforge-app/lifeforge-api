import express, { Request, Response } from "express";
import { body } from "express-validator";
import fs from "fs";
import mime from "mime-types";
import * as mm from "music-metadata";
import { BaseResponse } from "../../../interfaces/base_response";
import { IMusicEntry } from "../../../interfaces/music_interfaces";
import asyncWrapper from "../../../utils/asyncWrapper";
import { list } from "../../../utils/CRUD";
import { successWithBaseResponse } from "../../../utils/response";

const router = express.Router();

let importProgress: "in_progress" | "completed" | "failed" | "empty" = "empty";

router.get(
  "/",
  asyncWrapper(async (req, res: Response<BaseResponse<IMusicEntry[]>>) =>
    list(req, res, "music_entries", {
      sort: "-is_favourite, name",
    }),
  ),
);

router.get(
  "/import-status",
  asyncWrapper(
    async (
      _: Request,
      res: Response<
        BaseResponse<{
          status: "in_progress" | "completed" | "failed" | "empty";
        }>
      >,
    ) => {
      successWithBaseResponse(res, { status: importProgress });
    },
  ),
);

router.post(
  "/import",
  asyncWrapper(async (req, res) => {
    if (importProgress === "in_progress") {
      res.status(400).json({ error: "Already importing" });
      return;
    }

    importProgress = "in_progress";
    res.status(202).json({
      state: "accepted",
      message: "Download started",
    });

    try {
      const { pb } = req;
      fs.readdirSync(`${process.cwd()}/../medium`)
        .filter((file) => file.startsWith("."))
        .forEach((file) => fs.unlinkSync(`${process.cwd()}/../medium/${file}`));

      const newFiles = fs
        .readdirSync(`${process.cwd()}/../medium`)
        .filter((file) => {
          const fileMime = mime.lookup(file);

          return (
            !file.startsWith(".") &&
            (fileMime ? fileMime.startsWith("audio") : false)
          );
        });

      for (const file of newFiles) {
        const fp = `${process.cwd()}/../medium/${file}`;
        const fileBuffer = fs.readFileSync(fp);
        const metadata = await mm.parseFile(fp);
        const artist = metadata.common.artist || "Unknown";
        const duration = metadata.format.duration || 0;

        await pb.collection("music_entries").create({
          name: metadata.common.title || file.split(".").slice(0, -1).join("."),
          author: artist,
          duration,
          file: new File([fileBuffer], file),
        });

        fs.unlinkSync(fp);
      }
      importProgress = "completed";
    } catch {
      importProgress = "failed";
    }
  }),
);

router.patch(
  "/:id",
  [body("name").notEmpty(), body("author").notEmpty()],
  asyncWrapper(async (req, res: Response<BaseResponse<IMusicEntry>>) => {
    const { pb } = req;
    const { id } = req.params;
    const { name, author } = req.body;

    const entry: IMusicEntry = await pb.collection("music_entries").update(id, {
      name,
      author,
    });

    successWithBaseResponse(res, entry);
  }),
);

router.delete(
  "/:id",
  asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { id } = req.params;

    await pb.collection("music_entries").delete(id);

    successWithBaseResponse(res);
  }),
);

router.post(
  "/favourite/:id",
  asyncWrapper(async (req, res: Response<BaseResponse<IMusicEntry>>) => {
    const { pb } = req;
    const { id } = req.params;

    const entries = await pb.collection("music_entries").getOne(id);
    const entry: IMusicEntry = await pb.collection("music_entries").update(id, {
      is_favourite: !entries.is_favourite,
    });

    successWithBaseResponse(res, entry);
  }),
);

export default router;
