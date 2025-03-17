import express from "express";
import asyncWrapper from "../../../core/utils/asyncWrapper";
import * as authController from "../controllers/auth.controller";
import {
  createOrUpdateMasterPasswordValidation,
  verifyMasterPasswordValidation,
  verifyOTPValidation,
} from "../middlewares/authValidation";

const router = express.Router();

router.get("/challenge", asyncWrapper(authController.getChallenge));

router.post(
  "/",
  createOrUpdateMasterPasswordValidation,
  asyncWrapper(authController.createOrUpdateMasterPassword),
);

router.post(
  "/verify",
  verifyMasterPasswordValidation,
  asyncWrapper(authController.verifyMasterPassword),
);

router.post(
  "/otp",
  verifyOTPValidation,
  asyncWrapper(authController.verifyOTP),
);

export default router;
