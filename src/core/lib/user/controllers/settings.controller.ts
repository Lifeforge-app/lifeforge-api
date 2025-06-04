import { z } from "zod/v4";

import { zodHandler } from "@utils/asyncWrapper";

import * as SettingsService from "../services/settings.service";

export const updateAvatar = zodHandler(
  {
    response: z.string(),
  },
  async ({ req: { file }, pb }) => SettingsService.updateAvatar(pb, file),
);

export const deleteAvatar = zodHandler(
  {
    response: z.void(),
  },
  async ({ pb }) => SettingsService.deleteAvatar(pb),
  {
    statusCode: 204,
  },
);

export const updateProfile = zodHandler(
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

export const requestPasswordReset = zodHandler(
  {
    response: z.void(),
  },
  async ({ pb }) => SettingsService.requestPasswordReset(pb),
);
