import { v4 } from "uuid";
import { z } from "zod/v4";

import { default as _validateOTP } from "@utils/validateOTP";
import { forgeController } from "@utils/zodifiedHandler";

import * as authService from "../services/auth.service";

export const getChallenge = forgeController(
  {
    response: z.string(),
  },
  async () => authService.challenge,
);

export const createOrUpdateMasterPassword = forgeController(
  {
    body: z.object({
      password: z.string(),
    }),
    response: z.void(),
  },
  async ({ pb, body: { password } }) =>
    authService.createOrUpdateMasterPassword(pb, password),
);

export const verifyMasterPassword = forgeController(
  {
    body: z.object({
      password: z.string(),
    }),
    response: z.boolean(),
  },
  async ({ pb, body: { password } }) =>
    authService.verifyMasterPassword(pb, password, authService.challenge),
);

export const verifyOTP = forgeController(
  {
    body: z.object({
      otp: z.string(),
      otpId: z.string(),
    }),
    response: z.boolean(),
  },
  async ({ pb, body }) => await _validateOTP(pb, body, authService.challenge),
);
