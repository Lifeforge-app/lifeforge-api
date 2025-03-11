import express, { Request, Response } from "express";
import { getAPIKey } from "../../../utils/getAPIKey";
import { clientError, successWithBaseResponse } from "../../../utils/response";
import OpenAI from "openai";
import { singleUploadMiddleware } from "../../../middleware/uploadMiddleware";
import { BaseResponse } from "../../../interfaces/base_response";
import fs from "fs";
import { IMomentVaultEntry } from "../../../interfaces/moment_vault_interfaces";
import ffmpeg from "fluent-ffmpeg";
import { checkExistence } from "../../../utils/PBRecordValidator";
import { fetchAI } from "../../../utils/fetchAI";
import { ListResult } from "pocketbase";
import { param } from "express-validator";

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
    res: Response<BaseResponse<ListResult<IMomentVaultEntry>>>
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
        entry.file = pb.files.getURL(entry, entry.file).split("/files/")[1];
    });

    successWithBaseResponse(res, entries);
  }
);

router.post(
  "/entries",
  singleUploadMiddleware,
  async (req: Request, res: Response<BaseResponse<IMomentVaultEntry>>) => {
    const { type } = req.body;
    const { pb } = req;

    if (type === "audio") {
      const { file } = req;
      if (!file) {
        clientError(res, "No file uploaded");
        return;
      }

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
            file.path.split("/").pop() || "audio.mp3"
          ),
          transcription,
        });

      if (entry.file) {
        entry.file = pb.files.getURL(entry, entry.file).split("/files/")[1];
      }

      fs.unlinkSync(file.path);

      successWithBaseResponse(res, entry, 201);
    }
  }
);

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
  apiKey: string
): Promise<string | null> {
  const openai = new OpenAI({
    apiKey,
  });

  const transcription = await openai.audio.transcriptions
    .create({
      file: fs.createReadStream(filePath),
      model: "whisper-1",
    })
    .catch((err) => {
      console.log(err);
      return null;
    });

  if (!transcription) {
    return null;
  }

  const response = await fetchAI({
    provider: "openai",
    apiKey,
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant in adding punctuations to voice transcription. Given a voice transcription, your task is to add punctuations to the transcription without changing any words.",
      },
      {
        role: "user",
        content: transcription.text,
      },
    ],
  });

  return response;
}

router.post(
  "/transcribe-existed/:id",
  [param("id").isString()],
  async (req: Request, res: Response<BaseResponse<string>>) => {
    const { id } = req.params;
    const { pb } = req;

    const apiKey = await getAPIKey("openai", req.pb);

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

    const fileLocation = `${process.cwd()}/../database/pb_data/storage/${entry.collectionId}/${entry.id}/${entry.file}`;

    if (!fs.existsSync(fileLocation)) {
      clientError(res, "File not found");
      return;
    }

    const response = await getTranscription(fileLocation, apiKey);

    if (!response) {
      clientError(res, "Failed to add punctuations to transcription");
      return;
    }

    await pb.collection("moment_vault_entries").update<IMomentVaultEntry>(id, {
      transcription: response,
    });

    successWithBaseResponse(res, response);
  }
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

    const apiKey = await getAPIKey("openai", req.pb);

    if (!apiKey) {
      clientError(res, "API key not found");
      return;
    }

    const response = await getTranscription(file.path, apiKey);

    fs.unlinkSync(file.path);

    if (!response) {
      clientError(res, "Failed to add punctuations to transcription");
      return;
    }

    successWithBaseResponse(res, response);
  }
);

export default router;
