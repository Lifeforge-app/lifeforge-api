import { forgeController } from "@functions/forgeController";
import { default as _validateOTP } from "@functions/validateOTP";
import { z } from "zod/v4";

import * as AuthService from "../services/auth.service";

export const validateOTP = forgeController(
  {
    body: z.object({
      otp: z.string(),
      otpId: z.string(),
    }),
    response: z.boolean(),
  },
  async ({ pb, body }) => await _validateOTP(pb, body),
);

export const generateOTP = forgeController(
  {
    response: z.string(),
  },
  async ({ pb }) => await AuthService.generateOTP(pb),
);

export const login = forgeController(
  {
    body: z.object({
      email: z.string(),
      password: z.string(),
    }),
    response: z.union([
      z.object({
        state: z.literal("2fa_required"),
        tid: z.string(),
      }),
      z.object({
        state: z.literal("success"),
        session: z.string(),
        userData: z.record(z.string(), z.any()),
      }),
    ]),
  },
  async ({ body: { email, password } }) =>
    await AuthService.login(email, password),
);

export const verifySessionToken = forgeController(
  {
    response: z.object({
      session: z.string(),
      userData: z.record(z.string(), z.any()),
    }),
  },
  async ({ req }) =>
    AuthService.verifySessionToken(
      req.headers.authorization?.split(" ")[1].trim(),
    ),
);
