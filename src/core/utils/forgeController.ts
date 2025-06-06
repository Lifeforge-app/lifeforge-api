import { Request, Response } from "express";
import PocketBase from "pocketbase";
import { ZodObject, ZodRawShape, ZodTypeAny, z } from "zod/v4";

import { BaseResponse } from "@typescript/base_response";

import {
  ControllerCallback,
  ControllerOptions,
  ControllerSchema,
  InferResponseType,
  InferZodType,
} from "../typescript/forge_controller.types";
import ClientError from "./ClientError";
import { checkExistence } from "./PBRecordValidator";
import { clientError, serverError, successWithBaseResponse } from "./response";

export function forgeController<
  BodySchema extends ZodObject<ZodRawShape> | undefined = undefined,
  QuerySchema extends ZodObject<ZodRawShape> | undefined = undefined,
  ParamsSchema extends ZodObject<ZodRawShape> | undefined = undefined,
  ResponseSchema extends ZodTypeAny = ZodTypeAny,
>(
  schema: ControllerSchema<
    BodySchema,
    QuerySchema,
    ParamsSchema,
    ResponseSchema
  >,
  cb: ControllerCallback<BodySchema, QuerySchema, ParamsSchema, ResponseSchema>,
  options?: ControllerOptions<BodySchema, QuerySchema, ParamsSchema>,
) {
  const controller = async function LifeforgeRouteController(
    this: { pb: PocketBase },
    req: Request<
      InferZodType<ParamsSchema>,
      any,
      InferZodType<BodySchema>,
      InferZodType<QuerySchema>
    >,
    res: Response<BaseResponse<InferResponseType<ResponseSchema>>>,
  ): Promise<void> {
    try {
      for (const key of ["body", "query", "params"] as const) {
        const validator = schema[key];
        if (validator) {
          const result = validator.safeParse(req[key]);
          if (!result.success) {
            return clientError(res, {
              location: key,
              message: JSON.parse(result.error.message),
            });
          }

          if (key === "body") {
            req.body = result.data as InferZodType<BodySchema>;
          } else if (key === "query") {
            req.query = result.data as InferZodType<QuerySchema>;
          } else if (key === "params") {
            req.params = result.data as InferZodType<ParamsSchema>;
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

  controller.meta = {
    schema,
    options,
  };

  return controller;
}
