import express from "express";
import validationMiddleware from "../../../middleware/validationMiddleware";
import * as authController from "../controllers/authController";
import {
  createOrUpdateMasterPasswordValidation,
  verifyMasterPasswordValidation,
  verifyOTPValidation,
} from "../middlewares/authValidation";

const router = express.Router();

/**
 * @protected
 * @summary Get authentication challenge
 * @description Retrieves the challenge string for authentication.
 * @response 200 (string) - The challenge string
 */
router.get("/challenge", authController.getChallenge);

/**
 * @protected
 * @summary Create or update API keys master password
 * @description Creates or updates the master password for API keys management.
 * @body id (string, required) - The user ID
 * @body password (string, required) - The master password
 * @response 200 - Password was successfully saved
 */
router.post(
  "/",
  createOrUpdateMasterPasswordValidation,
  validationMiddleware,
  authController.createOrUpdateMasterPassword,
);

/**
 * @protected
 * @summary Verify master password
 * @description Verifies if the provided master password is correct.
 * @body password (string, required) - The master password to verify
 * @response 200 (boolean) - Whether the password is correct
 */
router.post(
  "/verify",
  verifyMasterPasswordValidation,
  validationMiddleware,
  authController.verifyMasterPassword,
);

/**
 * @protected
 * @summary Verify OTP
 * @description Verifies if the provided OTP is correct.
 * @body otp (string, required) - The OTP to verify
 * @body otpId (string, required) - The OTP ID
 * @response 200 (boolean) - Whether the OTP is correct
 */
router.post(
  "/otp",
  verifyOTPValidation,
  validationMiddleware,
  authController.verifyOTP,
);

export default router;
