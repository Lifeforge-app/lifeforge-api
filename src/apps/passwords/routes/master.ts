import bcrypt from "bcrypt";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import { v4 } from "uuid";

import { BaseResponse } from "@typescript/base_response";

import asyncWrapper from "@utils/asyncWrapper";
import checkOTP from "@utils/checkOTP";
import { decrypt2 } from "@utils/encryption";
import { successWithBaseResponse } from "@utils/response";

const router = express.Router();

let challenge = v4();

setTimeout(() => {
  challenge = v4();
}, 1000 * 60);

router.get(
  "/challenge",
  asyncWrapper(async (_: Request, res: Response<BaseResponse<string>>) => {
    successWithBaseResponse(res, challenge);
  }),
);

router.post(
  "/",
  [body("id").exists().notEmpty(), body("password").exists().notEmpty()],
  asyncWrapper(async (req, res) => {
    const { id, password } = req.body;
    const { pb } = req;

    const salt = await bcrypt.genSalt(10);
    const masterPasswordHash = await bcrypt.hash(password, salt);

    await pb.collection("users").update(id, {
      masterPasswordHash,
    });

    successWithBaseResponse(res);
  }),
);

router.post(
  "/verify",
  asyncWrapper(async (req, res: Response<BaseResponse<boolean>>) => {
    const { password } = req.body;
    const { pb } = req;

    if (!pb.authStore.record) {
      successWithBaseResponse(res, false);
      return;
    }

    const decryptedMaster = decrypt2(password, challenge);

    const user = await pb.collection("users").getOne(pb.authStore.record.id);
    const { masterPasswordHash } = user;

    const isMatch = await bcrypt.compare(decryptedMaster, masterPasswordHash);

    successWithBaseResponse(res, isMatch);
  }),
);

router.post(
  "/otp",
  [body("otp").isString().notEmpty(), body("otpId").isString().notEmpty()],
  asyncWrapper(async (req, res: Response<BaseResponse<boolean>>) => {
    checkOTP(req, res, challenge);
  }),
);

export default router;
