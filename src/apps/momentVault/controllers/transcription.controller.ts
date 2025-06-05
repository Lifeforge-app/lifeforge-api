import z from "zod/v4";

import ClientError from "@utils/ClientError";
import { forgeController } from "@utils/forgeController";

import * as TranscriptionService from "../services/transcription.service";
import { convertToMp3 } from "../utils/convertToMP3";

export const transcribeExisted = forgeController(
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

export const transcribeNew = forgeController(
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
