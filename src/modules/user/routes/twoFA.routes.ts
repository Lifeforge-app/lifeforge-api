import asyncWrapper from "@utils/asyncWrapper";
import checkOTP from "@utils/checkOTP";
import { decrypt, decrypt2, encrypt, encrypt2 } from "@utils/encryption";
import { clientError, successWithBaseResponse } from "@utils/response";
import express, { Response } from "express";
import { body, query } from "express-validator";
import moment from "moment";
import speakeasy from "speakeasy";
import { v4 } from "uuid";
import { currentSession } from "..";
import { BaseResponse } from "../../../core/typescript/base_response";
import { removeSensitiveData, updateNullData } from "../utils/auth";

let challenge = v4();

const router = express.Router();

if (!process.env.MASTER_KEY) {
  throw new Error("MASTER_KEY not found in environment variables");
}

let tempCode = "";

router.get(
  "/challenge",
  asyncWrapper(async (_, res: Response<BaseResponse<string>>) => {
    successWithBaseResponse(res, challenge);
  }),
);

router.get(
  "/otp",
  [query("email").isString().notEmpty()],
  asyncWrapper(async (req, res: Response<BaseResponse<string>>) => {
    const { pb } = req;
    const { email } = req.query;

    const otp = await pb
      .collection("users")
      .requestOTP(email as string)
      .catch(() => null);

    if (!otp) {
      clientError(res, "Failed to send OTP", 500);
      return;
    }

    currentSession.tokenId = v4();
    currentSession.otpId = otp.otpId;
    currentSession.tokenExpireAt = moment().add(5, "minutes").toISOString();

    successWithBaseResponse(res, currentSession.tokenId);
  }),
);

router.post(
  "/otp",
  [body("otp").isString().notEmpty(), body("otpId").isString().notEmpty()],
  asyncWrapper(async (req, res: Response<BaseResponse<boolean>>) => {
    checkOTP(req, res, challenge);
  }),
);

router.get(
  "/link",
  asyncWrapper(async (req, res) => {
    const { pb } = req;

    if (!pb.authStore.record?.id) {
      clientError(res, "User not authenticated", 401);
      return;
    }

    tempCode = speakeasy.generateSecret({
      name: pb.authStore.record.email,
      length: 32,
      issuer: "Lifeforge.",
    }).base32;

    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      clientError(res, "No token provided", 401);
      return;
    }

    successWithBaseResponse(
      res,
      encrypt2(
        encrypt2(
          `otpauth://totp/${pb.authStore.record.email}?secret=${tempCode}&issuer=Lifeforge.`,
          challenge,
        ),
        token,
      ),
    );
  }),
);

router.post(
  "/verify-and-enable",
  [body("otp").isString().notEmpty()],
  asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { otp } = req.body;

    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      clientError(res, "No token provided", 401);
      return;
    }

    const decryptedOTP = decrypt2(decrypt2(otp, token), challenge);

    const verified = speakeasy.totp.verify({
      secret: tempCode,
      encoding: "base32",
      token: decryptedOTP,
    });

    if (!verified) {
      clientError(res, "Invalid OTP", 401);
      return;
    }

    await pb.collection("users").update(pb.authStore.record!.id, {
      twoFASecret: encrypt(
        Buffer.from(tempCode),
        process.env.MASTER_KEY!,
      ).toString("base64"),
    });

    successWithBaseResponse(res);
  }),
);

router.post(
  "/disable",
  asyncWrapper(async (req, res) => {
    const { pb } = req;

    if (!pb.authStore.record?.id) {
      clientError(res, "User not authenticated", 401);
      return;
    }

    await pb.collection("users").update(pb.authStore.record.id, {
      twoFASecret: "",
    });

    successWithBaseResponse(res);
  }),
);

router.post(
  "/verify",
  [
    body("otp").isString().notEmpty(),
    body("tid").isString().notEmpty(),
    body("type").isIn(["email", "app"]),
  ],
  asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { otp, tid, type } = req.body;

    if (tid !== currentSession.tokenId) {
      clientError(res, "Invalid token ID", 401);
      return;
    }

    if (moment().isAfter(moment(currentSession.tokenExpireAt))) {
      clientError(res, "Token expired", 401);
      return;
    }

    const currentSessionToken = currentSession.token;

    if (!currentSessionToken) {
      clientError(res, "No token stored", 401);
      return;
    }

    try {
      pb.authStore.save(currentSessionToken, null);
      await pb.collection("users").authRefresh();

      if (!pb.authStore.record) {
        clientError(res, "Invalid authorization credentials", 401);
        return;
      }
    } catch {
      clientError(res, "Invalid authorization credentials", 401);
      return;
    }

    if (type === "app") {
      const encryptedSecret = pb.authStore.record?.twoFASecret;

      if (!encryptedSecret) {
        clientError(res, "2FA not enabled", 401);
        return;
      }

      const secret = decrypt(
        Buffer.from(encryptedSecret, "base64"),
        process.env.MASTER_KEY!,
      );

      const verified = speakeasy.totp.verify({
        secret: secret.toString(),
        encoding: "base32",
        token: otp,
      });

      if (!verified) {
        clientError(res, "Invalid OTP", 401);
        return;
      }
    } else if (type === "email") {
      if (!currentSession.otpId) {
        clientError(res, "No OTP ID stored", 401);
        return;
      }

      const authData = await pb
        .collection("users")
        .authWithOTP(currentSession.otpId, otp)
        .catch(() => null);

      if (!authData || !pb.authStore.isValid) {
        clientError(res, "Invalid OTP", 401);
        return;
      }
    }

    const userData = pb.authStore.record;

    removeSensitiveData(userData);

    await updateNullData(userData, pb);

    res.json({
      state: "success",
      token: pb.authStore.token,
      userData,
    });
  }),
);

export default router;
