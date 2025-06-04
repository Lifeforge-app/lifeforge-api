import express from "express";

import * as twoFAController from "../controllers/twoFA.controller";

const router = express.Router();

if (!process.env.MASTER_KEY) {
  throw new Error("MASTER_KEY not found in environment variables");
}

router.get("/challenge", twoFAController.getChallenge);

router.get("/otp", twoFAController.requestOTP);

router.post("/otp", twoFAController.validateOTP);

router.get("/link", twoFAController.generateAuthtenticatorLink);

router.post("/verify-and-enable", twoFAController.verifyAndEnable2FA);

router.post("/disable", twoFAController.disable2FA);

router.post("/verify", twoFAController.verify2FA);

export default router;
