import { Request, Response } from "express";
import fs from "fs";
import { BaseResponse } from "../../../interfaces/base_response";
import { IIdeaBoxContainer } from "../../../interfaces/ideabox_interfaces";
import { checkExistence } from "../../../utils/PBRecordValidator";
import { clientError, successWithBaseResponse } from "../../../utils/response";
import * as containersService from "../services/containersService";

export const checkContainerExists = async (req: Request, res: Response) => {
  const { id } = req.params;
  const exists = await containersService.checkContainerExists(req.pb, id);
  successWithBaseResponse(res, exists);
};

export const getContainers = async (
  req: Request,
  res: Response<BaseResponse<IIdeaBoxContainer[]>>,
) => {
  const containers = await containersService.getContainers(req.pb);

  const processedContainers = containers.map((container) => ({
    ...container,
    cover: container.cover
      ? req.pb.files
          .getURL(container, container.cover)
          .replace(`${req.pb.baseURL}/api/files`, "")
      : "",
  }));

  successWithBaseResponse(res, processedContainers);
};

export const createContainer = async (
  req: Request,
  res: Response<BaseResponse<IIdeaBoxContainer>>,
) => {
  const { name, color, icon } = req.body;

  if (req.file) {
    try {
      const fileBuffer = fs.readFileSync(req.file.path);
      const container = await containersService.createContainer(
        req.pb,
        name,
        color,
        icon,
        new File([fileBuffer], req.file.filename),
      );

      if (container.cover) {
        container.cover = req.pb.files
          .getURL(container, container.cover)
          .replace(`${req.pb.baseURL}/api/files`, "");
      }

      successWithBaseResponse(res, container, 201);
      fs.unlinkSync(req.file.path);
    } catch (error) {
      if (req.file) fs.unlinkSync(req.file.path);
      clientError(res, "Failed to create container");
    }
    return;
  }

  const url = req.body.cover;

  if (url) {
    try {
      const response = await fetch(url);
      const fileBuffer = await response.arrayBuffer();

      const container = await containersService.createContainer(
        req.pb,
        name,
        color,
        icon,
        new File([fileBuffer], "cover.jpg"),
      );

      if (container.cover) {
        container.cover = req.pb.files
          .getURL(container, container.cover)
          .replace(`${req.pb.baseURL}/api/files`, "");
      }

      successWithBaseResponse(res, container, 201);
    } catch (error) {
      clientError(res, "Invalid file");
    }
  } else {
    try {
      const container = await containersService.createContainer(
        req.pb,
        name,
        color,
        icon,
      );

      successWithBaseResponse(res, container, 201);
    } catch (error) {
      clientError(res, "Failed to create container");
    }
  }
};

export const updateContainer = async (
  req: Request,
  res: Response<BaseResponse<IIdeaBoxContainer>>,
) => {
  const { id } = req.params;
  const { name, color, icon } = req.body;

  if (!(await checkExistence(req, res, "idea_box_containers", id))) {
    if (req.file) fs.unlinkSync(req.file.path);
    return;
  }

  if (req.file) {
    try {
      const fileBuffer = fs.readFileSync(req.file.path);
      const container = await containersService.updateContainer(
        req.pb,
        id,
        name,
        color,
        icon,
        new File([fileBuffer], req.file.filename),
      );

      if (container.cover) {
        container.cover = req.pb.files
          .getURL(container, container.cover)
          .replace(`${req.pb.baseURL}/api/files`, "");
      }

      successWithBaseResponse(res, container);
      fs.unlinkSync(req.file.path);
    } catch (error) {
      if (req.file) fs.unlinkSync(req.file.path);
      clientError(res, "Failed to update container");
    }
    return;
  }

  const url = req.body.cover;

  if (url === "keep") {
    try {
      const container = await containersService.updateContainerKeepCover(
        req.pb,
        id,
        name,
        color,
        icon,
      );

      if (container.cover) {
        container.cover = req.pb.files
          .getURL(container, container.cover)
          .replace(`${req.pb.baseURL}/api/files`, "");
      }

      successWithBaseResponse(res, container);
    } catch (error) {
      clientError(res, "Failed to update container");
    }
  } else if (url) {
    try {
      const response = await fetch(url);
      const fileBuffer = await response.arrayBuffer();

      const container = await containersService.updateContainer(
        req.pb,
        id,
        name,
        color,
        icon,
        new File([fileBuffer], "cover.jpg"),
      );

      if (container.cover) {
        container.cover = req.pb.files
          .getURL(container, container.cover)
          .replace(`${req.pb.baseURL}/api/files`, "");
      }

      successWithBaseResponse(res, container);
    } catch (error) {
      clientError(res, "Invalid file");
    }
  } else {
    try {
      const container = await containersService.updateContainer(
        req.pb,
        id,
        name,
        color,
        icon,
      );

      successWithBaseResponse(res, container);
    } catch (error) {
      clientError(res, "Failed to update container");
    }
  }
};

export const deleteContainer = async (
  req: Request,
  res: Response<BaseResponse>,
) => {
  const { id } = req.params;

  if (!(await checkExistence(req, res, "idea_box_containers", id))) {
    return;
  }

  try {
    await containersService.deleteContainer(req.pb, id);
    successWithBaseResponse(res, undefined, 204);
  } catch (error) {
    clientError(res, "Failed to delete container");
  }
};
