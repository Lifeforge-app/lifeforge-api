import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import { success, successWithBaseResponse } from "../../../utils/response.js";
import asyncWrapper from "../../../utils/asyncWrapper.js";
import { decrypt2 } from "../../../utils/encryption.js";
import { body } from "express-validator";
import { challenge } from "../index.js";
import hasError from "../../../utils/checkError.js";
import { BaseResponse } from "../../../interfaces/base_response.js";
import checkOTP from "../../../utils/checkOTP.js";

const router = express.Router();

router.get(
  "/challenge",
  asyncWrapper(async (_: Request, res: Response<string>) => {
    success(res, challenge);
  })
);

router.post(
  "/",
  [body("id").exists().notEmpty(), body("password").exists().notEmpty()],
  asyncWrapper(async (req, res: Response<BaseResponse>) => {
    if (hasError(req, res)) return;

    const { id, password } = req.body;
    const { pb } = req;

    const salt = await bcrypt.genSalt(10);
    const journalMasterPasswordHash = await bcrypt.hash(password, salt);

    await pb.collection("users").update(id, {
      journalMasterPasswordHash,
    });

    successWithBaseResponse(res);
  })
);

router.post(
  "/verify",
  asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { password } = req.body;
    const id = pb.authStore.record?.id;

    if (!id) {
      success(res, false);
      return;
    }

    const decryptedMaster = decrypt2(password, challenge);

    const user = await pb.collection("users").getOne(id);
    const { journalMasterPasswordHash } = user;

    const isMatch = await bcrypt.compare(
      decryptedMaster,
      journalMasterPasswordHash
    );

    success(res, isMatch);
  })
);

router.post(
  "/otp",
  [body("otp").isString().notEmpty(), body("otpId").isString().notEmpty()],
  asyncWrapper(async (req, res: Response<BaseResponse<boolean>>) => {
    if (hasError(req, res)) return;
    checkOTP(req, res, challenge);
  })
);

export default router;
