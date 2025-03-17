import { serverError, successWithBaseResponse } from "@utils/response";
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

  try {
    const result = await miscService.getPath(req.pb, container, path, req, res);
    if (!result) return;

    successWithBaseResponse(res, result);
  } catch (error) {
    console.error(error);
    serverError(res, "Failed to fetch path");
  }
};

export const checkValid = async (
  req: Request,
  res: Response<BaseResponse<boolean>>,
) => {
  const { container } = req.params;
  const path = req.params[0].split("/").filter((p) => p !== "");

  try {
    const isValid = await miscService.checkValid(
      req.pb,
      container,
      path,
      req,
      res,
    );
    successWithBaseResponse(res, isValid);
  } catch (error) {
    console.error(error);
    serverError(res, "Failed to check validity");
  }
};

export const getOgData = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await miscService.getOgData(req.pb, id, req, res);
    if (!result) return;

    successWithBaseResponse(res, result);
  } catch (error) {
    console.error(error);
    serverError(res, "Failed to fetch og data");
  }
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

  try {
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
  } catch (error) {
    console.error(error);
    serverError(res, "Failed to search");
  }
};
