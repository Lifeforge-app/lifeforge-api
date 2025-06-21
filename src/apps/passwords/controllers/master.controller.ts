import { forgeController } from "@functions/forgeController";
import { default as _validateOTP } from "@functions/validateOTP";
import { v4 } from "uuid";
import { z } from "zod/v4";

import * as MasterService from "../services/master.service";

let challenge = v4();

setTimeout(() => {
  challenge = v4();
}, 1000 * 60);

export const getChallenge = forgeController(
  {
    response: z.string(),
  },
  async () => challenge,
);

export const createMaster = forgeController(
  {
    body: z.object({
      password: z.string(),
    }),
    response: z.void(),
  },
  async ({ pb, body: { password } }) =>
    MasterService.createMaster(pb, password),
);

export const verifyMaster = forgeController(
  {
    body: z.object({
      password: z.string(),
    }),
    response: z.boolean(),
  },
  async ({ pb, body: { password } }) =>
    MasterService.verifyMaster(pb, password, challenge),
);

export const validateOTP = forgeController(
  {
    body: z.object({
      otp: z.string(),
      otpId: z.string(),
    }),
    response: z.boolean(),
  },
  async ({ pb, body }) => await _validateOTP(pb, body, challenge),
);
