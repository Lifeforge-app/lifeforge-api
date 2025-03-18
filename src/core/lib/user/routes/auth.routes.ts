import asyncWrapper from "@utils/asyncWrapper";
import checkOTP from "@utils/checkOTP";
import { clientError, successWithBaseResponse } from "@utils/response";
import express, { Response } from "express";
import { body, query } from "express-validator";
import moment from "moment";
import Pocketbase, { AuthProviderInfo } from "pocketbase";
import { v4 } from "uuid";
import { currentSession } from "..";
import { BaseResponse } from "../../../typescript/base_response";
import { removeSensitiveData, updateNullData } from "../utils/auth";

const router = express.Router();

let currentCodeVerifier: string | null = null;

router.get(
  "/oauth-providers",
  asyncWrapper(async (req, res) => {
    const pb = new Pocketbase(process.env.PB_HOST);

    const providers = (
      await pb.collection("users").listAuthMethods()
    ).oauth2.providers.map((e) => e.name);

    successWithBaseResponse(res, providers);
  }),
);

router.get(
  "/oauth-endpoint",
  [query("provider").isString()],
  asyncWrapper(async (req, res: Response<BaseResponse<AuthProviderInfo>>) => {
    const { pb } = req;

    const { provider } = req.query;

    const oauthEndpoints = await pb.collection("users").listAuthMethods();

    const endpoint = oauthEndpoints.oauth2.providers.find(
      (item) => item.name === provider,
    );

    if (!endpoint) {
      clientError(res, "Invalid provider");
      return;
    }

    currentCodeVerifier = endpoint.codeVerifier;

    successWithBaseResponse(res, endpoint);
  }),
);

router.post(
  "/oauth-verify",
  [body("provider").isString(), body("code").isString()],
  asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { provider: providerName, code } = req.body;

    const providers = await pb.collection("users").listAuthMethods();

    const provider = providers.oauth2.providers.find(
      (item) => item.name === providerName,
    );

    if (!provider || !currentCodeVerifier) {
      clientError(res, "Invalid login attempt");
      return;
    }

    pb.collection("users")
      .authWithOAuth2Code(
        provider.name,
        code,
        currentCodeVerifier,
        `${req.headers.origin}/auth`,
        {
          emailVisibility: false,
        },
      )
      .then((authData) => {
        if (authData) {
          if (pb.authStore.record?.twoFASecret) {
            currentSession.token = pb.authStore.token;
            currentSession.tokenExpireAt = moment()
              .add(5, "minutes")
              .toISOString();
            currentSession.tokenId = v4();

            successWithBaseResponse(res, {
              state: "2fa_required",
              tid: currentSession.tokenId,
            });

            return;
          }

          successWithBaseResponse(res, pb.authStore.token);
        } else {
          clientError(res, "Invalid credentials", 401);
        }
      })
      .catch(() => {
        clientError(res, "Invalid credentials", 401);
      })
      .finally(() => {
        currentCodeVerifier = null;
      });
  }),
);

router.get(
  "/otp",
  asyncWrapper(async (req, res) => {
    const { pb } = req;

    const response = await pb
      .collection("users")
      .requestOTP(pb.authStore.record?.email)
      .catch(() => {
        clientError(res, "Failed to send OTP");
      });

    if (response) {
      successWithBaseResponse(res, response.otpId);
    }
  }),
);

router.post(
  "/otp",
  [body("otp").isString().notEmpty(), body("otpId").isString().notEmpty()],
  asyncWrapper(async (req, res: Response<BaseResponse<boolean>>) => {
    checkOTP(req, res);
  }),
);

router.post(
  "/login",
  [body("email").isEmail(), body("password").isString()],
  asyncWrapper(async (req, res) => {
    const { email, password } = req.body;
    const pb = new Pocketbase(process.env.PB_HOST);

    let failed = false;

    await pb
      .collection("users")
      .authWithPassword(email, password)
      .catch(() => {
        failed = true;
      });

    if (pb.authStore.isValid && !failed) {
      const userData = pb.authStore.record;

      if (!userData) {
        res.status(401).send({
          state: "error",
          message: "Invalid credentials",
        });
        return;
      }

      removeSensitiveData(userData);

      if (userData.twoFAEnabled) {
        currentSession.token = pb.authStore.token;
        currentSession.tokenExpireAt = moment().add(5, "minutes").toISOString();
        currentSession.tokenId = v4();

        res.json({
          state: "2fa_required",
          tid: currentSession.tokenId,
        });

        return;
      }

      await updateNullData(userData, pb);

      res.json({
        state: "success",
        token: pb.authStore.token,
        userData,
      });
    } else {
      clientError(res, "Invalid credentials", 401);
    }
  }),
);

router.post(
  "/verify",
  asyncWrapper(async (req, res) => {
    const bearerToken = req.headers.authorization?.split(" ")[1];
    const pb = new Pocketbase(process.env.PB_HOST);

    if (!bearerToken) {
      clientError(res, "No token provided", 401);
      return;
    }

    pb.authStore.save(bearerToken, null);
    await pb.collection("users").authRefresh();

    if (pb.authStore.isValid) {
      const userData = pb.authStore.record;

      if (!userData) {
        clientError(res, "Invalid token", 401);
        return;
      }

      removeSensitiveData(userData);

      await updateNullData(userData, pb);

      res.json({
        state: "success",
        token: pb.authStore.token,
        userData,
      });
    }
  }),
);

export default router;
