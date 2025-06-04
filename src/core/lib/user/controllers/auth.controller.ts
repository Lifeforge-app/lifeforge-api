import { z } from "zod/v4";

import { zodHandler } from "@utils/asyncWrapper";
import { default as _validateOTP } from "@utils/validateOTP";

import * as AuthService from "../services/auth.service";

export const validateOTP = zodHandler(
  {
    body: z.object({
      otp: z.string(),
      otpId: z.string(),
    }),
    response: z.boolean(),
  },
  async ({ pb, body }) => await _validateOTP(pb, body),
);

export const generateOTP = zodHandler(
  {
    response: z.string(),
  },
  async ({ pb }) => await AuthService.generateOTP(pb),
);

export const login = zodHandler(
  {
    body: z.object({
      email: z.string(),
      password: z.string(),
    }),
    response: z.union([
      z.object({
        state: "2fa_required",
        tid: z.string(),
      }),
      z.object({
        state: "success",
        session: z.string(),
        userData: z.record(z.string(), z.any()),
      }),
    ]),
  },
  async ({ body: { email, password } }) =>
    await AuthService.login(email, password),
);

export const verifySessionToken = zodHandler(
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
