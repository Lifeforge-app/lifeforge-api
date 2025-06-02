import { BaseResponse } from "@typescript/base_response";
import { WithoutPBDefault } from "@typescript/pocketbase_interfaces";
import { checkExistence } from "@utils/PBRecordValidator";
import { clientError, successWithBaseResponse } from "@utils/response";
import { Request, Response } from "express";
import fs from "fs";
import * as ideasService from "../services/ideas.service";
import { IIdeaBoxEntry } from "../typescript/ideabox_interfaces";

export const getIdeas = async (
  req: Request,
  res: Response<BaseResponse<IIdeaBoxEntry[]>>,
) => {
  const { pb } = req;
  const path = req.params[0].split("/").filter((e) => e);
  const { container } = req.params;
  const { archived } = req.query as Record<string, string>;

  const containerExist = await checkExistence(
    req,
    res,
    "idea_box_containers",
    container,
  );

  if (!containerExist) return;

  const { folderExists, lastFolder } = await ideasService.validateFolderPath(
    pb,
    container,
    path,
  );

  if (!folderExists) {
    clientError(res, "folder: Not found");
    return;
  }

  const ideas = await ideasService.getIdeas(
    pb,
    container,
    lastFolder,
    archived,
  );
  successWithBaseResponse(res, ideas);
};

export const createIdea = async (
  req: Request,
  res: Response<BaseResponse<IIdeaBoxEntry>>,
) => {
  const { pb } = req;
  const { container, title, content, type, imageLink, folder, tags } = req.body;
  const { file } = req;

  if (!(await checkExistence(req, res, "idea_box_containers", container))) {
    if (file) {
      fs.unlinkSync(file.path);
    }
    return;
  }

  let data: WithoutPBDefault<
    Omit<IIdeaBoxEntry, "image" | "pinned" | "archived">
  > & {
    image?: File;
  } = {
    type,
    container,
    folder,
    tags: tags || null,
  };

  switch (type) {
    case "text":
    case "link":
      data["title"] = title;
      data["content"] = content;
      break;
    case "image":
      if (imageLink) {
        const response = await fetch(imageLink);
        const buffer = await response.arrayBuffer();
        data["image"] = new File([buffer], "image.jpg", {
          type: "image/jpeg",
        });
        data["title"] = title;
      } else {
        if (!file) {
          clientError(res, "image: Invalid value");
          return;
        }

        data["image"] = new File([file.buffer], file.originalname, {
          type: file.mimetype,
        });
        data["title"] = title;
      }
      break;
  }

  const idea = await ideasService.createIdea(pb, data);
  await ideasService.updateIdeaTags(pb, idea, []);

  successWithBaseResponse(res, idea, 201);
};

export const updateIdea = async (
  req: Request,
  res: Response<BaseResponse<IIdeaBoxEntry>>,
) => {
  const { pb } = req;
  const { id } = req.params;
  const { title, content, type, tags } = req.body;

  if (!(await checkExistence(req, res, "idea_box_entries", id))) {
    return;
  }

  let data;
  switch (type) {
    case "text":
    case "link":
      data = {
        title,
        content,
        type,
        tags: tags || null,
      };
      break;
    case "image":
      data = {
        title,
        type,
        tags: tags || null,
      };
      break;
  }

  const { entry, oldEntry } = await ideasService.updateIdea(
    pb,
    id,
    data as any,
  );
  await ideasService.updateIdeaTags(pb, entry, oldEntry.tags);

  successWithBaseResponse(res, entry);
};

export const deleteIdea = async (req: Request, res: Response<BaseResponse>) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "idea_box_entries", id))) {
    return;
  }

  const idea = await ideasService.deleteIdea(pb, id);

  if (idea.tags) {
    await ideasService.updateIdeaTags(pb, { ...idea, tags: [] }, idea.tags);
  }

  successWithBaseResponse(res, undefined, 204);
};

export const pinIdea = async (
  req: Request,
  res: Response<BaseResponse<IIdeaBoxEntry>>,
) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "idea_box_entries", id))) {
    return;
  }

  const entry = await ideasService.updatePinStatus(pb, id);
  successWithBaseResponse(res, entry);
};

export const archiveIdea = async (
  req: Request,
  res: Response<BaseResponse<IIdeaBoxEntry>>,
) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "idea_box_entries", id))) {
    return;
  }

  const entry = await ideasService.updateArchiveStatus(pb, id);
  successWithBaseResponse(res, entry);
};

export const moveIdea = async (
  req: Request,
  res: Response<BaseResponse<IIdeaBoxEntry>>,
) => {
  const { pb } = req;
  const { id } = req.params;
  const { target } = req.query as Record<string, string>;

  const entryExist = await checkExistence(req, res, "idea_box_entries", id);
  const folderExist = await checkExistence(
    req,
    res,
    "idea_box_folders",
    target,
  );

  if (!(entryExist && folderExist)) return;

  const entry = await ideasService.moveIdea(pb, id, target);
  successWithBaseResponse(res, entry);
};

export const removeFromFolder = async (
  req: Request,
  res: Response<BaseResponse<IIdeaBoxEntry>>,
) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "idea_box_entries", id))) {
    return;
  }

  const entry = await ideasService.removeFromFolder(pb, id);
  successWithBaseResponse(res, entry);
};
