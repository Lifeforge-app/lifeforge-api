import express from "express";

import * as AuthController from "../controllers/auth.controller";

const router = express.Router();

router.get("/otp", AuthController.generateOTP);

router.post("/otp", AuthController.validateOTP);

router.post("/login", AuthController.login);

router.post("/verify", AuthController.verifySessionToken);

export default router;
