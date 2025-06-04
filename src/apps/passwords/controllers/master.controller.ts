import { v4 } from "uuid";
import { z } from "zod";

import { zodHandler } from "@utils/asyncWrapper";
import { default as _validateOTP } from "@utils/validateOTP";

import * as MasterService from "../services/master.service";

let challenge = v4();

setTimeout(() => {
  challenge = v4();
}, 1000 * 60);

export const getChallenge = zodHandler(
  {
    response: z.string(),
  },
  async () => challenge,
);

export const createMaster = zodHandler(
  {
    body: z.object({
      password: z.string(),
    }),
    response: z.void(),
  },
  async ({ pb, body: { password } }) =>
    MasterService.createMaster(pb, password),
);

export const verifyMaster = zodHandler(
  {
    body: z.object({
      password: z.string(),
    }),
    response: z.boolean(),
  },
  async ({ pb, body: { password } }) =>
    MasterService.verifyMaster(pb, password, challenge),
);

export const validateOTP = zodHandler(
  {
    body: z.object({
      otp: z.string(),
      otpId: z.string(),
    }),
    response: z.boolean(),
  },
  async ({ pb, body }) => await _validateOTP(pb, body, challenge),
  {
    statusCode: 200,
  },
);
