import { Response } from "express";
import fs from "fs";
import { BaseResponse } from "../interfaces/base_response";

function successWithBaseResponse<T>(
  res: Response<BaseResponse<T>>,
  data?: T,
  status: number = 200,
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

export { clientError, serverError, successWithBaseResponse };
