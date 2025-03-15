import { Response } from "express";
import { BaseResponse } from "../interfaces/base_response";
import fs from "fs";

function successWithBaseResponse<T>(
  res: Response<BaseResponse<T>>,
  data?: T,
  status: number = 200
) {
  try {
    res.status(status).json({
      state: "success",
      data: data ?? undefined,
    });
  } catch {
    console.error("Failed to send response");
  }
}

function clientError(res: Response, message = "Bad Request", status = 400) {
  fs.readdirSync("medium").forEach((file) => {
    fs.unlinkSync(`medium/${file}`);
  });

  try {
    res.status(status).json({
      state: "error",
      message,
    });
  } catch {
    console.error("Failed to send response");
  }
}

function serverError(res: Response, message = "Internal Server Error") {
  fs.readdirSync("medium").forEach((file) => {
    fs.unlinkSync(`medium/${file}`);
  });

  try {
    res.status(500).json({
      state: "error",
      message,
    });
  } catch {
    console.error("Failed to send response");
  }
}

export { successWithBaseResponse, clientError, serverError };
