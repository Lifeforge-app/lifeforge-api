import { NextFunction, Request, Response } from "express";
import hasError from "../utils/checkError";
import fs from "fs";

const validationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (hasError(req, res)) {
    fs.readdirSync("medium").map((file) => {
      fs.unlinkSync(`medium/${file}`);
    });

    return;
  }

  next();
};

export default validationMiddleware;
