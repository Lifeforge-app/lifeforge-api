import { z } from "zod/v4";

import ClientError from "@utils/ClientError";
import { forgeController } from "@utils/forgeController";
import { default as _validateOTP } from "@utils/validateOTP";

import * as twoFAService from "../services/twoFA.service";

export let canDisable2FA = false;

export const getChallenge = forgeController(
  {
    response: z.string(),
  },
  async () => twoFAService.getChallenge(),
);

export const requestOTP = forgeController(
  {
    query: z.object({
      email: z.email(),
    }),
    response: z.string(),
  },
  async ({ pb, query: { email } }) => await twoFAService.requestOTP(pb, email),
);

export const validateOTP = forgeController(
  {
    body: z.object({
      otp: z.string(),
      otpId: z.string(),
    }),
    response: z.boolean(),
  },
  async ({ pb, body }) => {
    if (await _validateOTP(pb, body, twoFAService.challenge)) {
      canDisable2FA = true;

      setTimeout(
        () => {
          canDisable2FA = false;
        },
        1000 * 60 * 5,
      );

      return true;
    }

    return false;
  },
);

export const generateAuthtenticatorLink = forgeController(
  {
    response: z.string(),
  },
  async ({
    pb,
    req: {
      headers: { authorization },
    },
  }) =>
    await twoFAService.generateAuthenticatorLink(
      pb,
      authorization!.replace("Bearer ", ""),
    ),
);

export const verifyAndEnable2FA = forgeController(
  {
    body: z.object({
      otp: z.string(),
    }),
    response: z.void(),
  },
  async ({
    pb,
    body: { otp },
    req: {
      headers: { authorization },
    },
  }) =>
    await twoFAService.verifyAndEnable2FA(
      pb,
      authorization!.replace("Bearer ", ""),
      otp,
    ),
);

export const disable2FA = forgeController(
  {
    response: z.void(),
  },
  async ({ pb }) => {
    if (!canDisable2FA) {
      throw new ClientError(
        "You cannot disable 2FA right now. Please try again later.",
        403,
      );
    }

    await twoFAService.disable2FA(pb);
    canDisable2FA = false;
  },
);

export const verify2FA = forgeController(
  {
    body: z.object({
      otp: z.string(),
      tid: z.string(),
      type: z.enum(["email", "app"]),
    }),
    response: z.object({
      session: z.string(),
      userData: z.record(z.string(), z.any()),
    }),
  },
  async ({ body: { otp, tid, type } }) =>
    twoFAService.verify2FA(otp, tid, type),
);
