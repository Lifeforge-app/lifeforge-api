import { NextFunction, Request, Response } from "express";
import { ZodTypeAny, z } from "zod";

import { BaseResponse } from "@typescript/base_response";

import hasError from "./checkError";
import { clientError, serverError } from "./response";

export const asyncWrapper =
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
  BodySchema extends ZodTypeAny = ZodTypeAny,
  QuerySchema extends ZodTypeAny = ZodTypeAny,
  ParamsSchema extends ZodTypeAny = ZodTypeAny,
  ResponseSchema extends ZodTypeAny = ZodTypeAny,
>(
  cb: (
    req: Request<
      ParamsSchema extends ZodTypeAny ? z.infer<ParamsSchema> : {},
      any,
      BodySchema extends ZodTypeAny ? z.infer<BodySchema> : {},
      QuerySchema extends ZodTypeAny ? z.infer<QuerySchema> : {}
    >,
    res: Response<BaseResponse<z.infer<ResponseSchema>>>,
    next: NextFunction,
  ) => Promise<void>,
  schema?: {
    body?: BodySchema;
    query?: QuerySchema;
    params?: ParamsSchema;
    response?: ResponseSchema;
  },
) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (schema?.body) {
        const result = schema.body.safeParse(req.body);
        if (!result.success) {
          return clientError(res, `Invalid body: ${result.error.message}`);
        }
        req.body = result.data;
      }

      if (schema?.query) {
        const result = schema.query.safeParse(req.query);
        if (!result.success) {
          return clientError(res, `Invalid query: ${result.error.message}`);
        }
        req.query = result.data;
      }

      if (schema?.params) {
        const result = schema.params.safeParse(req.params);
        if (!result.success) {
          return clientError(res, `Invalid params: ${result.error.message}`);
        }
        req.params = result.data;
      }

      await cb(req as any, res, next); // still need slight cast here for Zod-narrowed types
    } catch (err) {
      console.error("Internal error:", err);
      serverError(res, "Internal server error");
    }
  };
}
