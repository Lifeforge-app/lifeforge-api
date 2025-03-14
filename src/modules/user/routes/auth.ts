import express, { Response } from "express";
import { body, query } from "express-validator";
import { AuthProviderInfo } from "pocketbase";
import asyncWrapper from "../../../utils/asyncWrapper";
import checkOTP from "../../../utils/checkOTP";
import { clientError, successWithBaseResponse } from "../../../utils/response";
import { BaseResponse } from "../../../interfaces/base_response";
import Pocketbase from "pocketbase";

const router = express.Router();

let currentCodeVerifier: string | null = null;

function removeSensitiveData(userData: Record<string, any>): void {
  for (let key in userData) {
    if (key.includes("webauthn")) {
      delete userData[key];
    }
  }

  userData.hasMasterPassword = Boolean(userData.masterPasswordHash);
  userData.hasJournalMasterPassword = Boolean(
    userData.journalMasterPasswordHash
  );
  userData.hasAPIKeysMasterPassword = Boolean(
    userData.APIKeysMasterPasswordHash
  );
  delete userData["masterPasswordHash"];
  delete userData["journalMasterPasswordHash"];
  delete userData["APIKeysMasterPasswordHash"];
  delete userData["otp"];
}

async function updateNullData(userData: Record<string, any>, pb: Pocketbase) {
  if (!userData.enabledModules) {
    await pb.collection("users").update(userData.id, {
      enabledModules: [],
    });
    userData.enabledModules = [];
  }

  if (!userData.dashboardLayout) {
    await pb.collection("users").update(userData.id, {
      dashboardLayout: {},
    });
    userData.dashboardLayout = {};
  }
}

/**
 * @public
 * @summary Get the OAuth endpoint for a provider
 * @description Retrieve the OAuth endpoint and the related information for a given provider.
 * @query provider (string, required, must_exist) - The name of the provider
 * @response 200 (AuthProviderInfo) - The OAuth endpoint information
 */
router.get(
  "/oauth-endpoint",
  [query("provider").isString()],
  asyncWrapper(async (req, res: Response<BaseResponse<AuthProviderInfo>>) => {
    const { pb } = req;

    const { provider } = req.query;

    const oauthEndpoints = await pb.collection("users").listAuthMethods();

    const endpoint = oauthEndpoints.oauth2.providers.find(
      (item) => item.name === provider
    );

    if (!endpoint) {
      clientError(res, "Invalid provider");
      return;
    }

    currentCodeVerifier = endpoint.codeVerifier;

    successWithBaseResponse(res, endpoint);
  })
);

/**
 * @public
 * @summary Verify an OAuth code
 * @description Verify an OAuth code with the given provider. If the code is valid, the user will be logged in, and a session token will be returned.
 * @body provider (string, required) - The name of the provider
 * @body code (string, required) - The OAuth code
 * @response 200 - The user data and the token
 */
router.post(
  "/oauth-verify",
  [body("provider").isString(), body("code").isString()],
  asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { provider: providerName, code } = req.body;

    const providers = await pb.collection("users").listAuthMethods();

    const provider = providers.oauth2.providers.find(
      (item) => item.name === providerName
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
        `${req.headers.origin}@request.auth.id != \"\"`,
        {
          emailVisibility: false,
        }
      )
      .then((authData) => {
        if (authData) {
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
  })
);

/**
 * @protected
 * @summary Request an OTP
 * @description Request a One-Time Password (OTP) for the user.
 * @response 200 (string) - The OTP ID
 */
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
  })
);

router.post(
  "/otp",
  [body("otp").isString().notEmpty(), body("otpId").isString().notEmpty()],
  asyncWrapper(async (req, res: Response<BaseResponse<boolean>>) => {
    checkOTP(req, res);
  })
);

/**
 * @public
 * @summary Login a user
 * @description Log in a user with the given email and password. If the credentials are valid, the user data and a session token will be returned.
 * @body email (string, required) - The email of the user. Will raise an error if the email is not valid.
 * @body password (string, required) - The password of the user.
 * @response 200 - The user data and the token
 */
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

      await updateNullData(userData, pb);

      res.json({
        state: "success",
        token: pb.authStore.token,
        userData,
      });
    } else {
      clientError(res, "Invalid credentials", 401);
    }
  })
);

/**
 * @public
 * @summary Verify a session token
 * @description Verify a session token in the Authorization header. If the token is valid, the user data will be returned.
 * @response 200 - The user data
 */
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
  })
);

export default router;
