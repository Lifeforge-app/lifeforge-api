import express from "express";

import asyncWrapper from "@utils/asyncWrapper";
import { successWithBaseResponse } from "@utils/response";

import authRoutes from "./routes/auth.routes";
import personalizationRoutes from "./routes/personalization.routes";
import settingsRoutes from "./routes/settings.routes";
import twoFARoutes from "./routes/twoFA.routes";

const router = express.Router();

export let currentSession = {
  token: "",
  tokenId: "",
  tokenExpireAt: "",
  otpId: "",
};

router.use("/auth", authRoutes);
router.use("/2fa", twoFARoutes);
router.use("/settings", settingsRoutes);
router.use("/personalization", personalizationRoutes);

router.patch(
  "/module",
  asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { data } = req.body;
    await pb.collection("users").update(req.pb.authStore.record!.id, {
      enabledModules: data,
    });

    successWithBaseResponse(res);
  }),
);

export default router;
