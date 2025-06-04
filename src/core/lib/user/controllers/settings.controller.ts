import { z } from "zod/v4";

import { forgeController } from "@utils/zodifiedHandler";

import * as SettingsService from "../services/settings.service";

export const updateAvatar = forgeController(
  {
    response: z.string(),
  },
  async ({ req: { file }, pb }) => SettingsService.updateAvatar(pb, file),
);

export const deleteAvatar = forgeController(
  {
    response: z.void(),
  },
  async ({ pb }) => SettingsService.deleteAvatar(pb),
  {
    statusCode: 204,
  },
);

export const updateProfile = forgeController(
  {
    body: z.object({
      data: z.object({
        username: z
          .string()
          .regex(/^[a-zA-Z0-9]+$/)
          .optional(),
        email: z.email().optional(),
        name: z.string().optional(),
        dateOfBirth: z.string().optional(),
      }),
    }),
    response: z.void(),
  },
  async ({ body: { data }, pb }) => SettingsService.updateProfile(pb, data),
  {
    statusCode: 200,
  },
);

export const requestPasswordReset = forgeController(
  {
    response: z.void(),
  },
  async ({ pb }) => SettingsService.requestPasswordReset(pb),
);
