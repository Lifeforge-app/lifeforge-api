import { body } from "express-validator";

export const createOrUpdateMasterPasswordValidation = [
  body("password").exists().notEmpty(),
];

export const verifyMasterPasswordValidation = [
  body("password").exists().notEmpty(),
];

export const verifyOTPValidation = [
  body("otp").isString().notEmpty(),
  body("otpId").isString().notEmpty(),
];
