import { Request, Response } from "express";
import { BaseResponse } from "../../../interfaces/base_response";
import { IBooksLibraryFileType } from "../../../interfaces/books_library_interfaces";
import { clientError, successWithBaseResponse } from "../../../utils/response";
import * as FileTypesService from "../services/fileTypesService";

export const getAllFileTypes = async (
  req: Request,
  res: Response<BaseResponse<IBooksLibraryFileType[]>>,
) => {
  const { pb } = req;

  const fileTypes = await FileTypesService.getAllFileTypes(pb);

  if (!fileTypes) {
    clientError(res, "Failed to fetch file types");
    return;
  }

  successWithBaseResponse(res, fileTypes);
};
