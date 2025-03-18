import { successWithBaseResponse } from "@utils/response";
import { Request, Response } from "express";
import { BaseResponse } from "../../../core/typescript/base_response";
import * as miscService from "../services/misc.service";
import {
  IIdeaBoxContainer,
  IIdeaBoxEntry,
  IIdeaBoxFolder,
} from "../typescript/ideabox_interfaces";

export const getPath = async (
  req: Request,
  res: Response<
    BaseResponse<{
      container: IIdeaBoxContainer;
      path: IIdeaBoxFolder[];
    }>
  >,
) => {
  const { container } = req.params;
  const path = req.params[0].split("/").filter((p) => p !== "");

  const result = await miscService.getPath(req.pb, container, path, req, res);
  if (!result) return;

  successWithBaseResponse(res, result);
};

export const checkValid = async (
  req: Request,
  res: Response<BaseResponse<boolean>>,
) => {
  const { container } = req.params;
  const path = req.params[0].split("/").filter((p) => p !== "");

  const isValid = await miscService.checkValid(
    req.pb,
    container,
    path,
    req,
    res,
  );
  successWithBaseResponse(res, isValid);
};

export const getOgData = async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await miscService.getOgData(req.pb, id, req, res);
  if (!result) return;

  successWithBaseResponse(res, result);
};

export const search = async (
  req: Request,
  res: Response<
    BaseResponse<
      (Omit<IIdeaBoxEntry, "folder"> & {
        folder?: IIdeaBoxFolder;
        expand: {
          folder?: IIdeaBoxFolder;
        };
      })[]
    >
  >,
) => {
  const { q, container, tags, folder } = req.query as Record<string, string>;

  const results = await miscService.search(
    req.pb,
    q,
    container || "",
    tags || "",
    folder || "",
    req,
    res,
  );
  if (!results) return;

  successWithBaseResponse(res, results as any);
};
