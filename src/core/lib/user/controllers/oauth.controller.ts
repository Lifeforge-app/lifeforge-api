import { z } from "zod/v4";

import { zodHandler } from "@utils/asyncWrapper";

import * as OAuthService from "../services/oauth.service";

export const listOAuthProviders = zodHandler(
  {
    response: z.array(z.string()),
  },
  async () => await OAuthService.listOAuthProviders(),
);

export const getOAuthEndpoint = zodHandler(
  {
    query: z.object({
      provider: z.string(),
    }),
    response: z.record(z.string(), z.any()),
  },
  async ({ pb, query: { provider } }) =>
    await OAuthService.getOAuthEndpoint(pb, provider),
);

export const oauthVerify = zodHandler(
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
