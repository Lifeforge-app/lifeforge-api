import express from "express";

import * as authController from "../controllers/auth.controller";

const router = express.Router();

router.get("/challenge", authController.getChallenge);

router.post("/", authController.createOrUpdateMasterPassword);

router.post("/verify", authController.verifyMasterPassword);

router.post("/otp", authController.verifyOTP);

export default router;
