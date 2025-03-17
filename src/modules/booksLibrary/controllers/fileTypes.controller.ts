import { successWithBaseResponse } from "@utils/response";
import { Request, Response } from "express";
import { BaseResponse } from "../../../core/typescript/base_response";
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
