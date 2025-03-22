import checkOTP from "@utils/checkOTP";
import { successWithBaseResponse } from "@utils/response";
import { Request, Response } from "express";
import { BaseResponse } from "../../../typescript/base_response";
import { challenge } from "../index";
import * as authService from "../services/auth.service";

export const getChallenge = async (
  _: Request,
  res: Response<BaseResponse<string>>,
) => {
  successWithBaseResponse(res, challenge);
};

export const createOrUpdateMasterPassword = async (
  req: Request,
  res: Response<BaseResponse<undefined>>,
) => {
  const { pb } = req;
  const { password } = req.body;

  await authService.createOrUpdateMasterPassword(pb, password);
  successWithBaseResponse(res);
};

export const verifyMasterPassword = async (
  req: Request,
  res: Response<BaseResponse<boolean>>,
) => {
  const { pb } = req;
  const { password } = req.body;

  const isMatch = await authService.verifyMasterPassword(
    pb,
    password,
    challenge,
  );
  successWithBaseResponse(res, isMatch);
};

export const verifyOTP = async (
  req: Request,
  res: Response<BaseResponse<boolean>>,
) => {
  checkOTP(req, res, challenge);
};
