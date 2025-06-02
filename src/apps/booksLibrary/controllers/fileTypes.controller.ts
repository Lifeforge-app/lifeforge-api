import { BaseResponse } from "@typescript/base_response";
import { successWithBaseResponse } from "@utils/response";
import { Request, Response } from "express";
import * as FileTypesService from "../services/fileTypes.service";
import { IBooksLibraryFileType } from "../typescript/books_library_interfaces";

export const getAllFileTypes = async (
  req: Request,
  res: Response<BaseResponse<IBooksLibraryFileType[]>>,
) => {
  const { pb } = req;

  const fileTypes = await FileTypesService.getAllFileTypes(pb);
  successWithBaseResponse(res, fileTypes);
};
