import express from "express";
import { createLazyRouter } from "express-lazy-router";
import { query } from "express-validator";
import fs from "fs";
import path from "path";
import request from "request";
import { z } from "zod/v4";

import { successWithBaseResponse } from "../utils/response";
import { forgeController } from "../utils/zodifiedHandler";

const LIB_ROUTES = JSON.parse(
  fs.readFileSync(
    path.resolve(process.cwd(), "src/core/routes/lib.routes.json"),
    "utf-8",
  ),
) as Record<string, string>;
const MODULE_ROUTES = JSON.parse(
  fs.readFileSync(
    path.resolve(process.cwd(), "src/core/routes/module.routes.json"),
    "utf-8",
  ),
) as Record<string, string>;

const lazyLoad = createLazyRouter();
const router = express.Router();

Object.entries(LIB_ROUTES).forEach(([route, module]) => {
  router.use(
    route,
    lazyLoad(
      () => import(path.resolve(process.cwd(), `src/core/lib/${module}`)),
    ),
  );
});

Object.entries(MODULE_ROUTES).forEach(([route, module]) => {
  router.use(
    route,
    lazyLoad(() => import(path.resolve(process.cwd(), `src/apps/${module}`))),
  );
});

router.get("/status", async (req, res) => {
  successWithBaseResponse(res, {
    environment: process.env.NODE_ENV,
  });
});

router.get("/", (_, res) => {
  successWithBaseResponse(res, true);
});

router.get(
  "/media/:collectionId/:entriesId/:photoId",
  [query("thumb").optional().isString(), query("token").optional().isString()],
  forgeController(
    {
      params: z.object({
        collectionId: z.string(),
        entriesId: z.string(),
        photoId: z.string(),
      }),
      query: z.object({
        thumb: z.string().optional(),
        token: z.string().optional(),
      }),
      response: z.any(),
    },
    async ({
      params: { collectionId, entriesId, photoId },
      query: { thumb, token },
      res,
    }) => {
      const searchParams = new URLSearchParams();

      if (thumb) {
        searchParams.append("thumb", thumb);
      }

      if (token) {
        searchParams.append("token", token);
      }

      request(
        `${process.env.PB_HOST}/api/files/${collectionId}/${entriesId}/${photoId}?${searchParams.toString()}`,
      ).pipe(res);
    },
    {
      noDefaultResponse: true,
    },
  ),
);

router.get(
  "/cors-anywhere",
  forgeController(
    {
      query: z.object({
        url: z.string().url(),
      }),
      response: z.any(),
    },
    async ({ query: { url }, res }) => {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${url}`);
      }

      if (response.headers.get("content-type")?.includes("application/json")) {
        const json = await response.json();
        return json;
      }

      return response.text();
    },
  ),
);

router.use((req, res) => {
  res.status(404);

  res.json({
    state: "error",
    message: "Endpoint not found",
  });
});

export default router;
