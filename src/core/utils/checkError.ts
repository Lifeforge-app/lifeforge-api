import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { clientError } from "./response";

export default function hasError(req: Request, res: Response) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    clientError(
      res,
      Object.values(result.mapped())
        // @ts-expect-error
        .map((item) => `${item.path}: ${item.msg}`)
        .join(", "),
    );
    return true;
  }
  return false;
}
