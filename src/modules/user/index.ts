import fs from "fs";
import express, { Request, Response } from "express";
import Pocketbase, { AuthProviderInfo } from "pocketbase";
import { clientError, successWithBaseResponse } from "../../utils/response";
import asyncWrapper from "../../utils/asyncWrapper";
import { singleUploadMiddleware } from "../../middleware/uploadMiddleware";
import { body } from "express-validator";
import { query } from "express-validator";
import moment from "moment";
import { BaseResponse } from "../../interfaces/base_response";
import checkOTP from "../../utils/checkOTP";

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

/**
 * @public
 * @summary Get the OAuth endpoint for a provider
 * @description Retrieve the OAuth endpoint and the related information for a given provider.
 * @query provider (string, required, must_exist) - The name of the provider
 * @response 200 (AuthProviderInfo) - The OAuth endpoint information
 */
router.get(
  "/auth/oauth-endpoint",
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
  "/auth/oauth-verify",
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
        `${req.headers.origin}/auth`,
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
  "/auth/otp",
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
  "/auth/otp",
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
  "/auth/login",
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
  "/auth/verify",
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

      res.json({
        state: "success",
        token: pb.authStore.token,
        userData,
      });
    }
  })
);

/**
 * @protected
 * @summary Change the module enabled status
 * @description Change the enabled status of all toggled modules.
 * @body data (array, required) - The array of enabled modules
 * @response 200 - The module status has been updated
 */
router.patch(
  "/module",
  asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { data } = req.body;
    await pb.collection("users").update(req.pb.authStore.record!.id, {
      enabledModules: data,
    });

    successWithBaseResponse(res);
  })
);

router.put(
  "/personalization/bg-image",
  singleUploadMiddleware,
  asyncWrapper(async (req, res) => {
    const { pb } = req;

    if (req.file) {
      const fileBuffer = fs.readFileSync(req.file.path);

      const newEntry = await pb
        .collection("users")
        .update(req.pb.authStore.record!.id, {
          bgImage: new File(
            [fileBuffer],
            `${req.pb.authStore.record!.id}.${req.file.originalname.split(".").pop()}`
          ),
        });

      successWithBaseResponse(
        res,
        `media/${newEntry.collectionId}/${newEntry.id}/${newEntry.bgImage}`
      );
      fs.unlinkSync(req.file.path);

      return;
    }

    if (!req.body.url) {
      clientError(res, "No file uploaded");
      return;
    }

    const { url } = req.body;
    fetch(url)
      .then(async (response) => {
        const fileBuffer = await response.arrayBuffer();
        const newEntry = await pb
          .collection("users")
          .update(req.pb.authStore.record!.id, {
            bgImage: new File(
              [new Uint8Array(fileBuffer)],
              `${req.pb.authStore.record!.id}.png`
            ),
          });

        successWithBaseResponse(
          res,
          `media/${newEntry.collectionId}/${newEntry.id}/${newEntry.bgImage}`
        );
      })
      .catch(() => {
        clientError(res, "Invalid file");
      });
  })
);

router.delete(
  "/personalization/bg-image",
  asyncWrapper(async (req, res) => {
    const { pb } = req;

    await pb.collection("users").update(req.pb.authStore.record!.id, {
      bgImage: null,
    });

    successWithBaseResponse(res);
  })
);

/**
 * @protected
 * @summary Change the personalization settings
 * @description Change the personalization settings of the user.
 * @body data (object, required, one_of fontFamily|theme|color|bgTemp|language|dashboardLayout|backdropFilters) - The personalization settings to update
 * @response 200 - The personalization settings have been updated
 */
router.patch(
  "/personalization",
  [
    body("data.fontFamily").optional().isString(),
    body("data.theme").optional().isString(),
    body("data.color").optional().isString(),
    body("data.bgTemp").optional().isString(),
    body("data.language").optional().isString(),
    body("data.dashboardLayout").optional().isString(),
    body("data.backdropFilters").optional().isObject(),
  ],
  asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { data } = req.body;
    const toBeUpdated: { [key: string]: any } = {};

    for (let item of [
      "fontFamily",
      "theme",
      "color",
      "bgTemp",
      "language",
      "dashboardLayout",
      "backdropFilters",
    ]) {
      if (data[item]) {
        toBeUpdated[item] = data[item];
      }
    }

    if (!Object.keys(toBeUpdated).length) {
      throw new Error("No data to update");
    }

    await pb
      .collection("users")
      .update(req.pb.authStore.record!.id, toBeUpdated);

    successWithBaseResponse(res);
  })
);

/**
 * @protected
 * @summary Change the avatar of the user
 * @description Change the avatar of the user with the uploaded file.
 * @body file (File, required) - The file to upload, must be an image
 * @response 200 - The avatar has been updated
 */
router.put(
  "/settings/avatar",
  singleUploadMiddleware,
  asyncWrapper(async (req, res) => {
    const { pb } = req;

    const file = req.file;

    if (!file) {
      clientError(res, "No file uploaded");
      return;
    }

    const { id } = pb.authStore.record as any;

    const fileBuffer = fs.readFileSync(file.path);

    const newRecord = await pb.collection("users").update(id, {
      avatar: new File(
        [fileBuffer],
        `${id}.${file.originalname.split(".").pop()}`
      ),
    });

    fs.unlinkSync(file.path);

    successWithBaseResponse(res, newRecord.avatar);
  })
);

/**
 * @protected
 * @summary Delete the avatar of the user
 * @description Delete the avatar of the user.
 * @response 204 - The avatar has been deleted
 */
router.delete(
  "/settings/avatar",
  asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { id } = pb.authStore.record as any;

    await pb.collection("users").update(id, {
      avatar: null,
    });

    successWithBaseResponse(res, undefined, 204);
  })
);

/**
 * @protected
 * @summary Change the user settings
 * @description Change the user settings of the user.
 * @body data (object, required, one_of username|email|name|dateOfBirth) - The user settings to update
 * @response 200 - The user settings have been updated
 */
router.patch(
  "/settings",
  [
    body("data.username").optional().isAlphanumeric(),
    body("data.email").optional().isEmail(),
    body("data.name").optional().isString(),
    body("data.dateOfBirth").optional().isString(),
  ],
  asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { id } = pb.authStore.record as any;
    const { data } = req.body;

    if (data.email) {
      await pb.collection("users").requestEmailChange(data.email);
    }

    const newData: {
      username?: string;
      name?: string;
      dateOfBirth?: string;
    } = {};

    if (data.username) newData.username = data.username;
    if (data.name) newData.name = data.name;
    if (data.dateOfBirth)
      newData.dateOfBirth = `${moment(data.dateOfBirth).add(1, "day").format("YYYY-MM-DD")}T00:00:00.000Z`;

    await pb.collection("users").update(id, newData);

    successWithBaseResponse(res);
  })
);

/**
 * @protected
 * @summary Request a password reset
 * @description Request a password reset for the user. An email will be sent to the user with a link to reset the password.
 * @response 200 - The password reset email has been sent
 */
router.post(
  "/settings/request-password-reset",
  asyncWrapper(async (req, res) => {
    const { pb } = req;

    await pb
      .collection("users")
      .requestPasswordReset(pb.authStore.record?.email);

    successWithBaseResponse(res);
  })
);

export default router;
