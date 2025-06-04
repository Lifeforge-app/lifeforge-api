import { z } from "zod/v4";

import { forgeController } from "@utils/zodifiedHandler";

import * as OAuthService from "../services/oauth.service";

export const listOAuthProviders = forgeController(
  {
    response: z.array(z.string()),
  },
  async () => await OAuthService.listOAuthProviders(),
);

export const getOAuthEndpoint = forgeController(
  {
    query: z.object({
      provider: z.string(),
    }),
    response: z.record(z.string(), z.any()),
  },
  async ({ pb, query: { provider } }) =>
    await OAuthService.getOAuthEndpoint(pb, provider),
);

export const oauthVerify = forgeController(
  {
    body: z.object({
      provider: z.string(),
      code: z.string(),
    }),
    response: z.union([
      z.string(),
      z.object({
        state: z.string(),
        tid: z.string(),
      }),
    ]),
  },
  async ({ pb, body, req }) =>
    await OAuthService.oauthVerify(pb, {
      ...body,
      origin: req.headers.origin || "",
    }),
);
