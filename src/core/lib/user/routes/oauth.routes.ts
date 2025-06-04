import express from "express";

import * as OAuthController from "../controllers/oauth.controller";

const router = express.Router();

router.get("/providers", OAuthController.listOAuthProviders);

router.get("/endpoint", OAuthController.getOAuthEndpoint);

router.post("/verify", OAuthController.oauthVerify);

export default router;
