import express from "express";
import { createLazyRouter } from "express-lazy-router";
import { query } from "express-validator";
import request from "request";
import { ROUTES } from "./constants/routes";
import asyncWrapper from "./utils/asyncWrapper";
import { successWithBaseResponse } from "./utils/response";

const lazyLoad = createLazyRouter();
const router = express.Router();

Object.entries(ROUTES).forEach(([path, module]) => {
  router.use(
    path,
    lazyLoad(() => import(module)),
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
  asyncWrapper(async (req, res) => {
    const { thumb, token } = req.query as {
      thumb?: string;
      token?: string;
    };

    const { collectionId, entriesId, photoId } = req.params;
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
  }),
);

router.use((req, res) => {
  res.status(404);

  res.json({
    state: "error",
    message: "Endpoint not found",
  });
});

export default router;
