import checkOTP from "@utils/checkOTP";
import { serverError, successWithBaseResponse } from "@utils/response";
import { Request, Response } from "express";
import { BaseResponse } from "../../../core/typescript/base_response";
import { challenge } from "../index";
import * as authService from "../services/auth.service";

/**
 * Get authentication challenge
 */
export const getChallenge = async (
  _: Request,
  res: Response<BaseResponse<string>>,
) => {
  successWithBaseResponse(res, challenge);
};

/**
 * Create or update API keys master password
 */
export const createOrUpdateMasterPassword = async (
  req: Request,
  res: Response<BaseResponse<undefined>>,
) => {
  const { pb } = req;
  const { id, password } = req.body;

  try {
    await authService.createOrUpdateMasterPassword(pb, id, password);
    successWithBaseResponse(res);
  } catch (error) {
    console.error(error);
    serverError(res, "Failed to save password");
  }
};

/**
 * Verify master password
 */
export const verifyMasterPassword = async (
  req: Request,
  res: Response<BaseResponse<boolean>>,
) => {
  const { pb } = req;
  const { password } = req.body;

  try {
    const isMatch = await authService.verifyMasterPassword(
      pb,
      password,
      challenge,
    );
    successWithBaseResponse(res, isMatch);
  } catch (error) {
    console.error(error);
    serverError(res, "Failed to verify password");
  }
};

/**
 * Verify OTP
 */
export const verifyOTP = async (
  req: Request,
  res: Response<BaseResponse<boolean>>,
) => {
  checkOTP(req, res, challenge);
};
