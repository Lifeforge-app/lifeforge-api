import { Request, Response } from "express";
import { successWithBaseResponse } from "./response.js";
import { decrypt2 } from "./encryption.js";

async function checkOTP(req: Request, res: Response, challenge: string) {
  const { otp, otpId } = req.body;
  const { pb } = req;
  const id = pb.authStore.record?.id;

  if (!id) {
    successWithBaseResponse(res, false);
    return;
  }

  const decryptedOTP = decrypt2(otp, challenge);
  const authData = await pb
    .collection("users")
    .authWithOTP(otpId, decryptedOTP)
    .catch(() => null);

  if (!authData || !pb.authStore.isValid) {
    successWithBaseResponse(res, false);
    return;
  }

  pb.authStore.clear();
  successWithBaseResponse(res, true);
}

export default checkOTP;