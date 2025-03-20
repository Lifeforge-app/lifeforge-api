import { NextFunction, Request, Response } from "express";
import hasError from "./checkError";
import { serverError } from "./response";

const asyncWrapper =
  <Req extends Request = Request, Res extends Response = Response>(
    cb: (req: Req, res: Res, next: NextFunction) => Promise<void>,
  ) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (hasError(req, res)) {
      return;
    }

    (cb as (req: Request, res: Response, next: NextFunction) => Promise<void>)(
      req,
      res,
      next,
    ).catch((err) => {
      console.error(
        `Error: ${err instanceof Error ? err.message : JSON.stringify(err)}`,
      );
      try {
        serverError(res, "Internal server error");
      } catch {
        console.error("Error while sending response");
      }
    });
  };

export default asyncWrapper;
