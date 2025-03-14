import express, { Response } from "express";
import { v4 } from "uuid";
import asyncWrapper from "../../../utils/asyncWrapper";
import { successWithBaseResponse } from "../../../utils/response";
import { BaseResponse } from "../../../interfaces/base_response";
import { body } from "express-validator";
import checkOTP from "../../../utils/checkOTP";

let challenge = v4();

const router = express.Router();

router.get(
  "/challenge",
  asyncWrapper(async (_, res: Response<BaseResponse<string>>) => {
    successWithBaseResponse(res, challenge);
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
