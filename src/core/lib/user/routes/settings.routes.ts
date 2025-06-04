import express from "express";

import { singleUploadMiddleware } from "../../../middlewares/uploadMiddleware";
import * as SettingsController from "../controllers/settings.controller";

const router = express.Router();

router.put("/avatar", singleUploadMiddleware, SettingsController.updateAvatar);

router.delete("/avatar", SettingsController.deleteAvatar);

router.patch("/", SettingsController.updateProfile);

router.post("/request-password-reset", SettingsController.requestPasswordReset);

export default router;
