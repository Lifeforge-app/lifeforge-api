import { NextFunction, Request, Response } from "express";
import PocketBase from "pocketbase";
import { ZodObject, ZodRawShape, ZodTypeAny, z } from "zod/v4";

import { BaseResponse } from "@typescript/base_response";

import ClientError from "./ClientError";
import { checkExistence } from "./PBRecordValidator";
import { clientError, serverError, successWithBaseResponse } from "./response";

export function zodHandler<
  BodySchema extends ZodObject<ZodRawShape> | undefined = undefined,
  QuerySchema extends ZodObject<ZodRawShape> | undefined = undefined,
  ParamsSchema extends ZodObject<ZodRawShape> | undefined = undefined,
  ResponseSchema extends ZodTypeAny = ZodTypeAny,
>(
  schema: {
    body?: BodySchema;
    query?: QuerySchema;
    params?: ParamsSchema;
    response: ResponseSchema;
  },
  cb: (_: {
    req: Request<
      ParamsSchema extends ZodObject<ZodRawShape> ? z.infer<ParamsSchema> : {},
      any,
      BodySchema extends ZodObject<ZodRawShape> ? z.infer<BodySchema> : {},
      QuerySchema extends ZodObject<ZodRawShape> ? z.infer<QuerySchema> : {}
    >;
    res: Response<
      BaseResponse<
        ResponseSchema extends ZodTypeAny ? z.infer<ResponseSchema> : {}
      >
    >;
    pb: PocketBase;
    params: ParamsSchema extends ZodObject<ZodRawShape>
      ? z.infer<ParamsSchema>
      : {};
    body: BodySchema extends ZodObject<ZodRawShape> ? z.infer<BodySchema> : {};
    query: QuerySchema extends ZodObject<ZodRawShape>
      ? z.infer<QuerySchema>
      : {};
  }) => Promise<
    ResponseSchema extends ZodTypeAny ? z.infer<ResponseSchema> : {}
  >,
  options?: {
    existenceCheck?: {
      params?: Partial<
        Record<
          keyof (ParamsSchema extends ZodObject<any>
            ? z.infer<ParamsSchema>
            : {}),
          string
        >
      >;
      body?: Partial<
        Record<
          keyof (BodySchema extends ZodObject<any> ? z.infer<BodySchema> : {}),
          string
        >
      >;
      query?: Partial<
        Record<
          keyof (QuerySchema extends ZodObject<any>
            ? z.infer<QuerySchema>
            : {}),
          string
        >
      >;
    };
    statusCode?: number;
    noDefaultResponse?: boolean;
  },
) {
  return async (
    req: Request<
      ParamsSchema extends ZodObject<ZodRawShape> ? z.infer<ParamsSchema> : {},
      any,
      BodySchema extends ZodObject<ZodRawShape> ? z.infer<BodySchema> : {},
      QuerySchema extends ZodObject<ZodRawShape> ? z.infer<QuerySchema> : {}
    >,
    res: Response<
      BaseResponse<
        ResponseSchema extends ZodTypeAny ? z.infer<ResponseSchema> : {}
      >
    >,
  ): Promise<void> => {
    try {
      for (const key of ["body", "query", "params"] as const) {
        const validator = schema[key];
        if (validator) {
          const result = validator.safeParse(req[key]);
          if (!result.success) {
            throw new ClientError(`Invalid ${key}: ${result.error.message}`);
          }

          if (key === "body") {
            req.body = result.data as BodySchema extends ZodObject<ZodRawShape>
              ? z.infer<BodySchema>
              : {};
          } else if (key === "query") {
            req.query =
              result.data as QuerySchema extends ZodObject<ZodRawShape>
                ? z.infer<QuerySchema>
                : {};
          } else if (key === "params") {
            req.params =
              result.data as ParamsSchema extends ZodObject<ZodRawShape>
                ? z.infer<ParamsSchema>
                : {};
          }
        }
      }

      for (const type of ["params", "body", "query"] as const) {
        if (options?.existenceCheck?.[type]) {
          for (const [key, collection] of Object.entries(
            options.existenceCheck[type],
          ) as Array<[keyof (typeof req)[typeof type], string]>) {
            const optional = collection.match(/^\[(.*)\]$/);
            const value = req[type][key] as string | string[] | undefined;

            if (optional && !value) {
              continue;
            }

            if (Array.isArray(value)) {
              for (const val of value) {
                if (
                  !(await checkExistence(
                    req as Request,
                    res,
                    collection.replace(/^\[(.*)\]$/, "$1"),
                    val,
                  ))
                ) {
                  return;
                }
              }
            } else if (
              !(await checkExistence(
                req as Request,
                res,
                collection.replace(/^\[(.*)\]$/, "$1"),
                value as string,
              ))
            ) {
              return;
            }
          }
        }
      }

      const response = await cb({
        req,
        res,
        pb: req.pb,
        params: req.params,
        body: req.body,
        query: req.query,
      });

      if (!options?.noDefaultResponse) {
        res.status(options?.statusCode || 200);
        successWithBaseResponse(res, response);
      }
    } catch (err) {
      if (ClientError.isClientError(err)) {
        return clientError(res, err.message, err.code);
      }

      console.error("Internal error:", err);
      serverError(res, "Internal server error");
    }
  };
}
