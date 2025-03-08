import { NextFunction, Request, Response } from "express";
import Pocketbase from "pocketbase";

if (!process.env.PB_HOST || !process.env.PB_EMAIL || !process.env.PB_PASSWORD) {
  throw new Error("Pocketbase environment variables not set");
}

const NO_NEED_AUTH = [
  "/status",
  "/user/passkey",
  "/user/auth/login",
  "/user/auth/oauth-endpoint",
  "/user/auth/oauth-verify",
  "/spotify",
  "/code-time/user/minutes",
  "/code-time/eventLog",
  "/photos/album/check-publicity",
  "/photos/album/valid",
  "/photos/album/get",
  "/photos/entries/list",
  "/photos/entries/name",
  "/photos/entries/download",
  "/media",
  "/books/list",
  "/books-library/cover",
  "/cron",
  "/style.css",
  "/youtube-videos/video/thumbnail",
  "/youtube-videos/video/stream",
  "/books-library/libgen/covers",
];

const pocketbaseMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bearerToken = req.headers.authorization?.split(" ")[1];
  const pb = new Pocketbase(process.env.PB_HOST);

  if (process.env.NODE_ENV === "test") {
    req.pb = new Pocketbase(process.env.PB_HOST);
    await req.pb
      .collection("users")
      .authWithPassword(process.env.PB_EMAIL!, process.env.PB_PASSWORD!);
    return next();
  }

  if (!bearerToken || req.url.startsWith("/user/auth")) {
    if (
      req.url === "/" ||
      NO_NEED_AUTH.some((route) => req.url.startsWith(route)) ||
      req.url.match(
        /\/locales\/(?:en|ms|zh-TW|zh-CN|zh)\/(?:common|modules|utils)\.\w+$/
      )
    ) {
      req.pb = pb;
      next();
      return;
    }
  }

  if (!bearerToken) {
    res.status(401).send({
      state: "error",
      message: "Authorization token is required",
    });
    return;
  }

  try {
    pb.authStore.save(bearerToken, null);

    try {
      await pb.collection("users").authRefresh();
    } catch (error: any) {
      if (error.response.code === 401) {
        res.status(401).send({
          state: "error",
          message: "Invalid authorization credentials",
        });
        return;
      }
    }

    req.pb = pb;
    next();
  } catch {
    res.status(500).send({
      state: "error",
      message: "Internal server error",
    });
  }
};

export default pocketbaseMiddleware;
