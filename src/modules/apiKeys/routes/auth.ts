import express, { Request, Response } from "express";
import { success, successWithBaseResponse } from "../../../utils/response";
import asyncWrapper from "../../../utils/asyncWrapper";
import { challenge } from "../index";
import { body } from "express-validator";
import { BaseResponse } from "../../../interfaces/base_response";
import hasError from "../../../utils/checkError";
import { decrypt2 } from "../../../utils/encryption";
import bcrypt from "bcrypt";
import checkOTP from "../../../utils/checkOTP";

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
    const { id, password } = req.body;
    const { pb } = req;

    const salt = await bcrypt.genSalt(10);
    const APIKeysMasterPasswordHash = await bcrypt.hash(password, salt);

    await pb.collection("users").update(id, {
      APIKeysMasterPasswordHash,
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
    const { APIKeysMasterPasswordHash } = user;

    const isMatch = await bcrypt.compare(
      decryptedMaster,
      APIKeysMasterPasswordHash
    );

    success(res, isMatch);
  })
);

router.post(
  "/otp",
  [body("otp").isString().notEmpty(), body("otpId").isString().notEmpty()],
  asyncWrapper(async (req, res: Response<BaseResponse<boolean>>) => {
    checkOTP(req, res, challenge);
  })
);

export default router;
