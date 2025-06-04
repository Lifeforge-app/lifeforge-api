import express from "express";

import authRoutes from "./routes/auth.routes";
import oauthRoutes from "./routes/oauth.routes";
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
router.use("/oauth", oauthRoutes);
router.use("/2fa", twoFARoutes);
router.use("/settings", settingsRoutes);
router.use("/personalization", personalizationRoutes);

export default router;
