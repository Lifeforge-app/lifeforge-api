import { NextFunction, Request, Response } from "express";
import { ZodTypeAny, z } from "zod";

import { BaseResponse } from "@typescript/base_response";

import hasError from "./checkError";
import { clientError, serverError } from "./response";

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

export function zodHandler<
  BodySchema extends ZodTypeAny | undefined = undefined,
  QuerySchema extends ZodTypeAny | undefined = undefined,
  ParamsSchema extends ZodTypeAny | undefined = undefined,
  ResponseSchema extends ZodTypeAny | undefined = undefined,
>(
  schema: {
    body?: BodySchema;
    query?: QuerySchema;
    params?: ParamsSchema;
    response: ResponseSchema;
  },
  cb: (
    req: Request<
      ParamsSchema extends ZodTypeAny ? z.infer<ParamsSchema> : {},
      any,
      BodySchema extends ZodTypeAny ? z.infer<BodySchema> : {},
      QuerySchema extends ZodTypeAny ? z.infer<QuerySchema> : {}
    >,
    res: Response<
      BaseResponse<
        ResponseSchema extends ZodTypeAny ? z.infer<ResponseSchema> : {}
      >
    >,
    next: NextFunction,
  ) => Promise<void>,
) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (hasError(req, res)) return;

      for (const key of ["body", "query", "params"] as const) {
        const validator = schema[key];
        if (validator) {
          const result = validator.safeParse(req[key]);
          if (!result.success) {
            return clientError(res, `Invalid ${key}: ${result.error.message}`);
          }
          req[key] = result.data;
        }
      }

      await cb(req as any, res as any, next);
    } catch (err) {
      console.error("Internal error:", err);
      serverError(res, "Internal server error");
    }
  };
}
