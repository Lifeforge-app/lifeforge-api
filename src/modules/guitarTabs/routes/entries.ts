import express, { Request, Response } from "express";
import asyncWrapper from "../../../utils/asyncWrapper";
import pdfThumbnail from "pdf-thumbnail";
// @ts-expect-error no type for this
import pdfPageCounter from "pdf-page-counter";
import fs from "fs";
import { clientError, successWithBaseResponse } from "../../../utils/response";
import { uploadMiddleware } from "../../../middleware/uploadMiddleware";
import { BaseResponse } from "../../../interfaces/base_response";
import {
  IGuitarTabsEntry,
  IGuitarTabsSidebarData,
} from "../../../interfaces/guitar_tabs_interfaces";
import moment from "moment";
import { body, query } from "express-validator";
import { checkExistence } from "../../../utils/PBRecordValidator";

const router = express.Router();

let processing = "empty";
let left = 0;
let total = 0;

router.get(
  "/sidebar-data",
  asyncWrapper(
    async (
      req: Request,
      res: Response<BaseResponse<IGuitarTabsSidebarData>>
    ) => {
      const { pb } = req;

      const allScores = await pb
        .collection("guitar_tabs_entries")
        .getFullList<IGuitarTabsEntry>();

      const data: IGuitarTabsSidebarData = {
        total: allScores.length,
        favourites: allScores.filter((entry) => entry.isFavourite).length,
        categories: {
          fingerstyle: allScores.filter((entry) => entry.type === "fingerstyle")
            .length,
          singalong: allScores.filter((entry) => entry.type === "singalong")
            .length,
          uncategorized: allScores.filter((entry) => entry.type === "").length,
        },
        authors: allScores.reduce(
          (acc, entry) => {
            if (!acc[entry.author]) {
              acc[entry.author] = 0;
            }
            acc[entry.author]++;
            return acc;
          },
          {} as Record<string, number>
        ),
      };

      successWithBaseResponse(res, data);
    }
  )
);

router.get(
  "/",
  [
    query("page").isNumeric().toInt(),
    query("query").optional().isString(),
    query("category").optional().isString(),
    query("author").optional().isString(),
    query("starred").optional().isBoolean().toBoolean(),
    query("sort").optional().isIn(["name", "author", "newest", "oldest"]),
  ],
  asyncWrapper(async (req, res) => {
    const { pb } = req;
    const page = parseInt((req.query.page as string) || "1") || 1;
    const search = decodeURIComponent((req.query.query as string) || "");

    const category = req.query.category === "all" ? "" : req.query.category;
    const author = req.query.author === "all" ? "" : req.query.author;
    const starred = req.query.starred;

    const entries = await pb
      .collection("guitar_tabs_entries")
      .getList<IGuitarTabsEntry[]>(page, 20, {
        filter: `(name~"${search}" || author~"${search}") && ${
          category === "uncategorized" ? "type=''" : `type~"${category}"`
        } && author~"${author}" ${starred ? "&& isFavourite=true" : ""}`,
        sort: `-isFavourite, ${
          req.query.sort === "newest"
            ? "-created"
            : req.query.sort === "oldest"
              ? "created"
              : (req.query.sort as string) || "-created"
        }`,
      });

    successWithBaseResponse(res, entries);
  })
);

router.post(
  "/upload",
  uploadMiddleware,
  asyncWrapper(async (req, res: Response<BaseResponse>) => {
    const { pb } = req;
    const files = req.files;

    if (!files) {
      clientError(res, "No files provided");
      return;
    }

    if (processing === "in_progress") {
      for (const file of files as Express.Multer.File[]) {
        fs.unlinkSync(file.path);
      }
      clientError(res, "Already processing");
      return;
    }

    let groups: Record<
      string,
      {
        pdf: Express.Multer.File | null;
        mscz: Express.Multer.File | null;
        mp3: Express.Multer.File | null;
      }
    > = {};

    for (const file of files as Express.Multer.File[]) {
      const decodedName = decodeURIComponent(file.originalname);
      const extension = decodedName.split(".").pop();

      if (!extension || !["mscz", "mp3", "pdf"].includes(extension)) continue;

      const name = decodedName.split(".").slice(0, -1).join(".");

      if (!groups[name]) {
        groups[name] = {
          pdf: null,
          mscz: null,
          mp3: null,
        };
      }

      groups[name][extension as "pdf" | "mscz" | "mp3"] = file;
    }

    for (const group of Object.values(groups)) {
      if (group.pdf) continue;

      for (const file of Object.values(group)) {
        if (!file) continue;

        fs.unlinkSync(file.path);
      }
    }

    groups = Object.fromEntries(
      Object.entries(groups).filter(([_, group]) => group.pdf)
    );

    processing = "in_progress";
    left = Object.keys(groups).length;
    total = Object.keys(groups).length;
    res.status(202).json({
      state: "accepted",
      message: "Processing started",
    });

    for (const group of Object.values(groups)) {
      try {
        const file = group.pdf!;
        const decodedName = decodeURIComponent(file.originalname);
        const name = decodedName.split(".").slice(0, -1).join(".");
        const path = file.path;
        const buffer = fs.readFileSync(path);

        const thumbnail = await pdfThumbnail(buffer, {
          compress: {
            type: "JPEG",
            quality: 70,
          },
        });

        const { numpages } = await pdfPageCounter(buffer);

        thumbnail
          .pipe(fs.createWriteStream(`medium/${decodedName}.jpg`))
          .once("close", async () => {
            const thumbnailBuffer = fs.readFileSync(
              `medium/${decodedName}.jpg`
            );

            const otherFiles: {
              audio: File | null;
              musescore: File | null;
            } = {
              audio: null,
              musescore: null,
            };

            if (group.mscz) {
              otherFiles.musescore = new File(
                [fs.readFileSync(group.mscz.path)],
                group.mscz.originalname
              );
            }

            if (group.mp3) {
              otherFiles.audio = new File(
                [fs.readFileSync(group.mp3.path)],
                group.mp3.originalname
              );
            }

            await pb.collection("guitar_tabs_entries").create(
              {
                name,
                thumbnail: new File([thumbnailBuffer], `${decodedName}.jpeg`),
                author: "",
                pdf: new File([buffer], decodedName),
                pageCount: numpages,
                ...otherFiles,
              },
              {
                $autoCancel: false,
              }
            );

            fs.unlinkSync(path);
            fs.unlinkSync(`medium/${decodedName}.jpg`);
            if (group.mscz) {
              fs.unlinkSync(group.mscz.path);
            }
            if (group.mp3) {
              fs.unlinkSync(group.mp3.path);
            }
            left--;

            if (left === 0) {
              processing = "completed";
            }
          });
      } catch (err) {
        processing = "failed";
        const allFilesLeft = fs.readdirSync("medium");
        for (const file of allFilesLeft) {
          fs.unlinkSync(`medium/${file}`);
        }

        left = 0;
        total = 0;
        break;
      }
    }
  })
);

router.get(
  "/process-status",
  asyncWrapper(
    async (
      _: Request,
      res: Response<
        BaseResponse<{
          status: string;
          left: number;
          total: number;
        }>
      >
    ) => {
      successWithBaseResponse(res, { status: processing, left, total });
    }
  )
);

router.patch(
  "/:id",
  [
    body("name").isString(),
    body("author").isString(),
    body("type").optional().isIn(["fingerstyle", "singalong"]),
  ],
  asyncWrapper(async (req, res: Response<BaseResponse<IGuitarTabsEntry>>) => {
    const { pb } = req;
    const { id } = req.params;
    const { name, author, type } = req.body;

    const updatedentries: IGuitarTabsEntry = await pb
      .collection("guitar_tabs_entries")
      .update(id, {
        name,
        author,
        type,
      });

    successWithBaseResponse(res, updatedentries);
  })
);

router.delete(
  "/:id",
  asyncWrapper(async (req, res: Response<BaseResponse>) => {
    const { pb } = req;
    const { id } = req.params;

    await pb.collection("guitar_tabs_entries").delete(id);

    successWithBaseResponse(res, undefined, 204);
  })
);

router.get(
  "/download-all",
  asyncWrapper(async (req, res) => {
    const { pb } = req;
    const entries = await pb
      .collection("guitar_tabs_entries")
      .getFullList<IGuitarTabsEntry>();

    let mediumLocation = `${process.cwd()}/../medium`;
    const date = moment().format("YYYY-MM-DD");
    if (!fs.existsSync(`${mediumLocation}/guitar_tabs-${date}`)) {
      fs.mkdirSync(`${mediumLocation}/guitar_tabs-${date}`);
      mediumLocation = `${mediumLocation}/guitar_tabs-${date}`;
    } else {
      let i = 1;
      while (fs.existsSync(`${mediumLocation}/guitar_tabs-${date}-${i}`)) {
        i++;
      }
      fs.mkdirSync(`${mediumLocation}/guitar_tabs-${date}-${i}`);
      mediumLocation = `${mediumLocation}/guitar_tabs-${date}-${i}`;
    }

    for (const entry of entries) {
      let targetLocation = mediumLocation;
      const folderLocation = `${process.cwd()}/../database/pb_data/storage/${entry.collectionId}/${entry.id}`;

      let i = 0;
      if (entry.audio || entry.musescore) {
        while (true) {
          const number = i === 0 ? "" : `-${i}`;
          if (fs.existsSync(`${mediumLocation}/${entry.name}${number}`)) {
            i++;
            continue;
          }
          fs.mkdirSync(`${mediumLocation}/${entry.name}${number}`);
          targetLocation = `${mediumLocation}/${entry.name}${number}`;
          break;
        }
      }

      i = 0;
      while (true) {
        const number = i === 0 ? "" : `-${i}`;
        if (fs.existsSync(`${targetLocation}/${entry.name}${number}.pdf`)) {
          i++;
          continue;
        }
        fs.copyFileSync(
          `${folderLocation}/${entry.pdf}`,
          `${targetLocation}/${entry.name}${number}.pdf`
        );
        break;
      }

      if (entry.audio) {
        i = 0;
        const ext = entry.audio.split(".").pop();
        while (true) {
          const number = i === 0 ? "" : `-${i}`;
          if (
            fs.existsSync(`${targetLocation}/${entry.name}${number}.${ext}`)
          ) {
            i++;
            continue;
          }
          fs.copyFileSync(
            `${folderLocation}/${entry.audio}`,
            `${targetLocation}/${entry.name}${number}.${ext}`
          );
          break;
        }

        if (entry.musescore) {
          i = 0;
          const ext = entry.musescore.split(".").pop();
          while (true) {
            const number = i === 0 ? "" : `-${i}`;
            if (
              fs.existsSync(`${targetLocation}/${entry.name}${number}.${ext}`)
            ) {
              i++;
              continue;
            }
            fs.copyFileSync(
              `${folderLocation}/${entry.musescore}`,
              `${targetLocation}/${entry.name}${number}.${ext}`
            );
            break;
          }
        }
      }
    }

    successWithBaseResponse(res);
  })
);

router.post(
  "/favourite/:id",
  asyncWrapper(async (req, res: Response<BaseResponse<IGuitarTabsEntry>>) => {
    const { pb } = req;
    const { id } = req.params;

    if (!(await checkExistence(req, res, "guitar_tabs_entries", id))) return;

    const entry = await pb
      .collection("guitar_tabs_entries")
      .getOne<IGuitarTabsEntry>(id);

    const updatedEntry = await pb
      .collection("guitar_tabs_entries")
      .update<IGuitarTabsEntry>(id, {
        isFavourite: !entry.isFavourite,
      });

    successWithBaseResponse(res, updatedEntry);
  })
);

export default router;
