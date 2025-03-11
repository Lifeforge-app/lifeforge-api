import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import request from "request";
import { rateLimit } from "express-rate-limit";
import Pocketbase from "pocketbase";
import morganMiddleware from "./middleware/morganMiddleware";
import pocketbaseMiddleware from "./middleware/pocketbaseMiddleware";

import DESCRIPTIONS from "./constants/description";

import asyncWrapper from "./utils/asyncWrapper";
import { query } from "express-validator";
import { flattenRoutes, getRoutes } from "./utils/getRoutes";
import router from "./routes";
import dotenv from "dotenv";
import { serverError, successWithBaseResponse } from "./utils/response";
import { BaseResponse } from "./interfaces/base_response";
import { IRoute } from "./interfaces/api_routes_interfaces";
import { watchInbox } from "./services/mailInbox/index";
import { CORS_ALLOWED_ORIGINS } from "./constants/corsAllowedOrigins";

dotenv.config({
  path: ".env.local",
});

let routesDataCache: Record<string, IRoute[]> | null = null;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 250,
  skip: async (req) => {
    if (
      req.path.startsWith("/media/") ||
      req.path.match(
        /\/locales\/(?:en|ms|zh-TW|zh-CN|zh)\/(?:common|modules)\.\w+$/
      ) ||
      [
        "/code-time/user/minutes",
        "/code-time/eventLog",
        "/user/passkey/challenge",
        "/user/passkey/login",
        "/user/auth/verify",
        "/user/auth/login",
        "/books-library/cover",
        "/status",
        "/youtube-videos/video/thumbnail",
      ].some((route) => req.path.trim().startsWith(route))
    ) {
      return true;
    }

    const bearerToken = req.headers.authorization?.split(" ")[1];
    const pb = new Pocketbase(process.env.PB_HOST);

    if (!bearerToken) {
      return false;
    }

    try {
      pb.authStore.save(bearerToken, null);

      try {
        await pb.collection("users").authRefresh();
        return true;
      } catch (error: any) {
        if (error.response.code === 401) {
          return false;
        }
      }
    } catch {
      return false;
    }
    return false;
  },
  validate: { xForwardedForHeader: false },
});

const app = express();
app.disable("x-powered-by");
app.set("view engine", "ejs");

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);
app.use(
  cors({
    origin: CORS_ALLOWED_ORIGINS,
  })
);
app.use(express.raw());
app.use(express.json({ limit: "50mb" }));
app.use(morganMiddleware);
app.use(pocketbaseMiddleware);
app.use(limiter);
app.use(express.static("static"));

const mainRouter = express.Router();

mainRouter.use("/", router);

mainRouter.get("/status", async (req, res) => {
  successWithBaseResponse(res, {
    environment: process.env.NODE_ENV,
  });
});

mainRouter.get(
  "/",
  asyncWrapper(
    async (
      _: Request,
      res: Response<BaseResponse<Record<string, IRoute[]>>>
    ) => {
      if (routesDataCache !== null) {
        successWithBaseResponse(res, routesDataCache);
        return;
      }

      const routes: Record<string, IRoute[]> = Object.fromEntries(
        Object.entries(
          flattenRoutes(getRoutes(`./src`, "routes.ts"))
            .map((route) => ({
              ...route,
              description:
                DESCRIPTIONS[
                `${route.method} ${route.path.replace(/:(\w+)/g, "{$1}")}` as keyof typeof DESCRIPTIONS
                ],
            }))
            .reduce((acc: Record<string, IRoute[]>, route) => {
              const r = route.path.split("/")[1] as keyof typeof acc;
              if (acc[r]) {
                acc[r].push(route);
              } else {
                acc[r] = [route];
              }
              return acc;
            }, {})
        ).map(([key, value]) => [
          key,
          value.sort((a, b) => {
            if (a.path.split("/")[2] === b.path.split("/")[2]) {
              return (
                ["GET", "POST", "PATCH", "PUT", "DELETE"].indexOf(a.method) -
                ["GET", "POST", "PATCH", "PUT", "DELETE"].indexOf(b.method)
              );
            }
            return a.path.localeCompare(b.path);
          }),
        ])
      );

      routesDataCache = routes;

      successWithBaseResponse(res, routes);
    }
  )
);

mainRouter.get(
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
      `${process.env.PB_HOST}/api/files/${collectionId}/${entriesId}/${photoId}?${searchParams.toString()}`
    ).pipe(res);
  })
);

mainRouter.get(
  "/locations",
  [query("q").isString(), query("key").isString()],
  asyncWrapper(async (req, res) => {
    // https://maps.googleapis.com/maps/api/place/autocomplete/json?input=taman+molek&key=AIzaSyACIfnP46cNm8nP9HaMafF0hwI9X0hyyg4
    const { q, key } = req.query;

    try {
      fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(q as string)}&key=${key}`
      )
        .then((response) => response.json())
        .then((data) => {
          successWithBaseResponse(res, data);
        })
        .catch((error) => {
          serverError(res);
        });
    } catch (error) {
      serverError(res);
    }
  })
);

mainRouter.get("/cron", async (req, res) => {
  res.json({
    state: "success",
  });
});

mainRouter.use((req, res) => {
  res.status(404);

  res.json({
    state: "error",
    message: "Endpoint not found",
  });
});

app.use("/", mainRouter);

export default app;
