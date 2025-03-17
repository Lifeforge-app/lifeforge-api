import { checkExistence } from "@utils/PBRecordValidator";
import { serverError, successWithBaseResponse } from "@utils/response";
import { Request, Response } from "express";
import { BaseResponse } from "../../../core/typescript/base_response";
import * as foldersService from "../services/folders.service";
import { IIdeaBoxFolder } from "../typescript/ideabox_interfaces";

export const getFolders = async (
  req: Request,
  res: Response<BaseResponse<IIdeaBoxFolder[]>>,
) => {
  try {
    const { pb } = req;
    const { container } = req.params;
    const path = req.params[0].split("/").filter((p) => p !== "");

    if (!(await checkExistence(req, res, "idea_box_containers", container))) {
      return;
    }

    const { folderExists, lastFolder } =
      await foldersService.validateFolderPath(pb, container, path);

    if (!folderExists) {
      serverError(res, "folder: Not found");
      return;
    }

    const folders = await foldersService.getFolders(pb, container, lastFolder);
    successWithBaseResponse(res, folders);
  } catch (error) {
    serverError(res, "Failed to fetch folders");
  }
};

export const createFolder = async (
  req: Request,
  res: Response<BaseResponse<IIdeaBoxFolder>>,
) => {
  try {
    const { pb } = req;
    const { name, container, parent, icon, color } = req.body;

    if (!(await checkExistence(req, res, "idea_box_containers", container))) {
      return;
    }

    const folder = await foldersService.createFolder(
      pb,
      name,
      container,
      parent,
      icon,
      color,
    );
    successWithBaseResponse(res, folder, 201);
  } catch (error) {
    serverError(res, "Failed to create folder");
  }
};

export const updateFolder = async (
  req: Request,
  res: Response<BaseResponse<IIdeaBoxFolder>>,
) => {
  try {
    const { pb } = req;
    const { id } = req.params;
    const { name, icon, color } = req.body;

    if (!(await checkExistence(req, res, "idea_box_folders", id))) {
      return;
    }

    const folder = await foldersService.updateFolder(pb, id, name, icon, color);
    successWithBaseResponse(res, folder);
  } catch (error) {
    serverError(res, "Failed to update folder");
  }
};

export const moveFolder = async (
  req: Request,
  res: Response<BaseResponse<IIdeaBoxFolder>>,
) => {
  try {
    const { pb } = req;
    const { id } = req.params;
    const { target } = req.query as Record<string, string>;

    const entryExist = await checkExistence(req, res, "idea_box_folders", id);
    if (!entryExist) {
      return;
    }

    const folderExist = await checkExistence(
      req,
      res,
      "idea_box_folders",
      target,
    );
    if (!folderExist) {
      return;
    }

    const entry = await foldersService.moveFolder(pb, id, target);
    successWithBaseResponse(res, entry);
  } catch (error) {
    serverError(res, "Failed to move folder");
  }
};

export const removeFromFolder = async (
  req: Request,
  res: Response<BaseResponse<IIdeaBoxFolder>>,
) => {
  try {
    const { pb } = req;
    const { id } = req.params;

    if (!(await checkExistence(req, res, "idea_box_folders", id))) {
      return;
    }

    const entry = await foldersService.removeFromFolder(pb, id);
    successWithBaseResponse(res, entry);
  } catch (error) {
    serverError(res, "Failed to remove from folder");
  }
};

export const deleteFolder = async (
  req: Request,
  res: Response<BaseResponse>,
) => {
  try {
    const { pb } = req;
    const { id } = req.params;

    if (!(await checkExistence(req, res, "idea_box_folders", id))) {
      return;
    }

    await foldersService.deleteFolder(pb, id);
    successWithBaseResponse(res, undefined, 204);
  } catch (error) {
    serverError(res, "Failed to delete folder");
  }
};
