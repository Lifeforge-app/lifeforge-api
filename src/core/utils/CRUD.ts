import { Request, Response } from "express";

import { BaseResponse } from "../typescript/base_response";
import { successWithBaseResponse } from "./response";

async function list<T>(
  req: Request,
  res: Response<BaseResponse<T[]>>,
  collection: string,
  options = {},
  postProcess?: (data: T[]) => T[],
) {
  const { pb } = req;

  const data: T[] = await pb.collection(collection).getFullList(options);

  successWithBaseResponse(res, postProcess ? postProcess(data) : data);
}

async function validate(req: Request, res: Response, collectionName: string) {
  const { pb } = req;
  const { id } = req.params;

  const { totalItems } = await pb.collection(collectionName).getList(1, 1, {
    filter: `id = "${id}"`,
  });

  successWithBaseResponse(res, totalItems === 1);
}

export { list, validate };
