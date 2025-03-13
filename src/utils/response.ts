import { Response } from "express";
import { BaseResponse } from "../interfaces/base_response";
import fs from "fs";

function successWithBaseResponse<T>(
  res: Response<BaseResponse<T>>,
  data?: T,
  status: number = 200
) {
  res.status(status).json({
    state: "success",
    data: data ?? undefined,
  });
}

function clientError(res: Response, message = "Bad Request", status = 400) {
  fs.readdirSync("medium").forEach((file) => {
    fs.unlinkSync(`medium/${file}`);
  });

  res.status(status).json({
    state: "error",
    message,
  });
}

function serverError(res: Response, message = "Internal Server Error") {
  fs.readdirSync("medium").forEach((file) => {
    fs.unlinkSync(`medium/${file}`);
  });

  res.status(500).json({
    state: "error",
    message,
  });
}

export { successWithBaseResponse, clientError, serverError };
