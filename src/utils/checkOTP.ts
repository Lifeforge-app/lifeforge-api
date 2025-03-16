import { Request, Response } from "express";
import { decrypt2 } from "./encryption";
import { successWithBaseResponse } from "./response";

async function checkOTP(req: Request, res: Response, challenge?: string) {
  const { otp, otpId } = req.body;
  const { pb } = req;
  const id = pb.authStore.record?.id;

  if (!id) {
    successWithBaseResponse(res, false);
    return;
  }

  let decryptedOTP;

  if (challenge) {
    decryptedOTP = decrypt2(otp, challenge);
  } else {
    decryptedOTP = otp;
  }

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
