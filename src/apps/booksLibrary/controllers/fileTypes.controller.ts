import { Request, Response } from "express";

import { BaseResponse } from "@typescript/base_response";

import { successWithBaseResponse } from "@utils/response";

import * as FileTypesService from "../services/fileTypes.service";
import { IBooksLibraryFileType } from "../typescript/books_library_interfaces";

export const getAllFileTypes = async (req: Request, res: Response) => {
  const { pb } = req;

  const fileTypes = await FileTypesService.getAllFileTypes(pb);
  successWithBaseResponse(res, fileTypes);
};
