import express from "express";

import * as MasterController from "../controllers/master.controller";

const router = express.Router();

router.get("/challenge", MasterController.getChallenge);

router.post("/", MasterController.createMaster);

router.post("/verify", MasterController.verifyMaster);

router.post("/otp", MasterController.validateOTP);

export default router;
