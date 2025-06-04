import z from "zod";

import ClientError from "@utils/ClientError";
import { zodHandler } from "@utils/asyncWrapper";

import * as TranscriptionService from "../services/transcription.service";
import { convertToMp3 } from "../utils/convertToMP3";

export const transcribeExisted = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: z.string(),
  },
  async ({ pb, params: { id } }) =>
    await TranscriptionService.transcribeExisted(pb, id),
  {
    existenceCheck: {
      params: {
        id: "moment_vault_entries",
      },
    },
  },
);

export const transcribeNew = zodHandler(
  {
    response: z.string(),
  },
  async ({ pb, req }) => {
    const { file } = req;
    if (!file) {
      throw new ClientError("No file uploaded");
    }

    if (file.mimetype !== "audio/mp3") {
      file.path = await convertToMp3(file.path);
    }

    return await TranscriptionService.transcribeNew(pb, file.path);
  },
);
