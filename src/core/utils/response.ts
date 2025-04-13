import { Response } from "express";
import fs from "fs";
import { BaseResponse } from "../typescript/base_response";

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
    if (fs.statSync("medium/" + file).isFile()) {
      fs.unlinkSync("medium/" + file);
    } else {
      fs.rmdirSync("medium/" + file, { recursive: true });
    }
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
    if (fs.statSync("medium/" + file).isFile()) {
      fs.unlinkSync("medium/" + file);
    } else {
      fs.rmdirSync("medium/" + file, { recursive: true });
    }
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
