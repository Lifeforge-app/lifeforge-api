import { BaseResponse } from "@typescript/base_response";
import { checkExistence } from "@utils/PBRecordValidator";
import { getAPIKey } from "@utils/getAPIKey";
import {
  clientError,
  serverError,
  successWithBaseResponse,
} from "@utils/response";
import express, { Request, Response } from "express";
import { param } from "express-validator";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import Groq from "groq-sdk";
import { ListResult } from "pocketbase";
import request from "request";
import {
  singleUploadMiddleware,
  uploadMiddleware,
} from "../../../core/middleware/uploadMiddleware";
import { IMomentVaultEntry } from "../typescript/moment_vault_interfaces";

const router = express.Router();

async function convertToMp3(filePath: string) {
  return new Promise<string>((resolve, reject) => {
    const newPath = filePath.split(".").slice(0, -1).join(".") + ".mp3";
    ffmpeg(filePath)
      .output(newPath)
      .on("end", () => {
        fs.unlinkSync(filePath);
        resolve(newPath);
      })
      .on("error", (err) => {
        reject(err);
      })
      .run();
  });
}

router.get(
  "/entries",
  async (
    req: Request,
    res: Response<BaseResponse<ListResult<IMomentVaultEntry>>>,
  ) => {
    const { pb } = req;
    const { page } = req.query as { page?: string };

    const entries = await pb
      .collection("moment_vault_entries")
      .getList<IMomentVaultEntry>(parseInt(page || "1"), 10, {
        sort: "-created",
      });

    entries.items.forEach((entry) => {
      if (entry.file)
        entry.file = entry.file.map(
          (file) => pb.files.getURL(entry, file).split("/files/")[1],
        );
    });

    successWithBaseResponse(res, entries);
  },
);

router.post(
  "/entries",
  uploadMiddleware,
  async (req: Request, res: Response<BaseResponse<IMomentVaultEntry>>) => {
    const { type } = req.body;
    const { pb } = req;

    if (type === "audio") {
      const { files } = req as { files: Express.Multer.File[] };

      if (!files?.length) {
        clientError(res, "No file uploaded");
        return;
      }

      const file = files[0];

      if (file.mimetype !== "audio/mp3") {
        process.env.FFMPEG_PATH = "/usr/bin/ffmpeg";
        file.path = await convertToMp3(file.path);
      }

      const fileBuffer = fs.readFileSync(file.path);
      const { transcription } = req.body;

      const entry = await pb
        .collection("moment_vault_entries")
        .create<IMomentVaultEntry>({
          type: "audio",
          file: new File(
            [fileBuffer],
            file.path.split("/").pop() || "audio.mp3",
          ),
          transcription,
        });

      if (entry.file) {
        entry.file = entry.file.map(
          (file) => pb.files.getURL(entry, file).split("/files/")[1],
        );
      }

      fs.unlinkSync(file.path);

      successWithBaseResponse(res, entry, 201);
    }

    if (type === "text") {
      const { content } = req.body;

      const entry = await pb
        .collection("moment_vault_entries")
        .create<IMomentVaultEntry>({
          type: "text",
          content,
        });

      successWithBaseResponse(res, entry, 201);
    }

    if (type === "photos") {
      const { files } = req as { files: Express.Multer.File[] };

      if (!files?.length) {
        clientError(res, "No file uploaded");
        return;
      }

      const allImages = files.map((file) => {
        const fileBuffer = fs.readFileSync(file.path);
        return new File(
          [fileBuffer],
          file.path.split("/").pop() || "photo.jpg",
        );
      });

      const entry = await pb
        .collection("moment_vault_entries")
        .create<IMomentVaultEntry>({
          type: "photos",
          file: allImages,
        });

      if (entry.file) {
        entry.file = (entry.file as string[]).map(
          (file) => pb.files.getURL(entry, file).split("/files/")[1],
        );
      }

      files.forEach((file) => {
        fs.unlinkSync(file.path);
      });

      successWithBaseResponse(res, entry, 201);
    }
  },
);

router.patch("/entries/:id", async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!(await checkExistence(req, res, "moment_vault_entries", id))) {
    return;
  }

  const { pb } = req;
  const updatedEntry = await pb
    .collection("moment_vault_entries")
    .update<IMomentVaultEntry>(id, {
      content,
    });

  successWithBaseResponse(res, updatedEntry);
});

router.delete("/entries/:id", async (req, res) => {
  const { id } = req.params;

  if (!(await checkExistence(req, res, "moment_vault_entries", id))) {
    return;
  }

  const { pb } = req;

  await pb.collection("moment_vault_entries").delete(id);

  successWithBaseResponse(res, undefined, 204);
});

async function getTranscription(
  filePath: string,
  apiKey: string,
): Promise<string | null> {
  const groq = new Groq({
    apiKey,
  });

  const transcription = await groq.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: "whisper-large-v3",
  });

  return transcription.text;
}

router.post(
  "/transcribe-existed/:id",
  [param("id").isString()],
  async (req: Request, res: Response<BaseResponse<string>>) => {
    const { id } = req.params;
    const { pb } = req;

    const apiKey = await getAPIKey("groq", req.pb);

    if (!apiKey) {
      clientError(res, "API key not found");
      return;
    }

    if (!(await checkExistence(req, res, "moment_vault_entries", id))) {
      return;
    }

    const entry = await pb
      .collection("moment_vault_entries")
      .getOne<IMomentVaultEntry>(id);

    if (!entry.file) {
      clientError(res, "File not found");
      return;
    }

    const fileURL = pb.files.getURL(entry, entry.file[0]);

    try {
      const filePath = `/tmp/${fileURL.split("/").pop()}`;
      const fileStream = fs.createWriteStream(filePath);

      request(fileURL).pipe(fileStream);

      await new Promise((resolve) => {
        fileStream.on("finish", () => {
          resolve(null);
        });
      });

      const response = await getTranscription(filePath, apiKey);

      if (!response) {
        clientError(res, "Failed to add punctuations to transcription");
        return;
      }

      await pb
        .collection("moment_vault_entries")
        .update<IMomentVaultEntry>(id, {
          transcription: response,
        });

      successWithBaseResponse(res, response);
    } catch {
      serverError(res, "Failed to transcribe audio");
      return;
    }
  },
);

router.post(
  "/transcribe",
  singleUploadMiddleware,
  async (req: Request, res: Response<BaseResponse<string>>) => {
    const { file } = req;
    if (!file) {
      clientError(res, "No file uploaded");
      return;
    }

    if (file.mimetype !== "audio/mp3") {
      process.env.FFMPEG_PATH = "/usr/bin/ffmpeg";
      file.path = await convertToMp3(file.path);
    }

    const apiKey = await getAPIKey("groq", req.pb);

    if (!apiKey) {
      clientError(res, "API key not found");
      return;
    }

    try {
      const response = await getTranscription(file.path, apiKey);

      if (!response) {
        clientError(res, "Failed to add punctuations to transcription");
        return;
      }

      successWithBaseResponse(res, response);
    } catch {
      serverError(res, "Failed to transcribe audio");
      return;
    } finally {
      fs.unlinkSync(file.path);
    }
  },
);

export default router;
