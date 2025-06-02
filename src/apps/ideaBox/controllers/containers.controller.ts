import { Request, Response } from "express";
import fs from "fs";

import { BaseResponse } from "@typescript/base_response";

import { checkExistence } from "@utils/PBRecordValidator";
import { successWithBaseResponse } from "@utils/response";

import * as containersService from "../services/containers.service";
import { IIdeaBoxContainer } from "../typescript/ideabox_interfaces";

export const checkContainerExists = async (req: Request, res: Response) => {
  const { id } = req.params;
  const exists = await containersService.checkContainerExists(req.pb, id);
  successWithBaseResponse(res, exists);
};

export const getContainers = async (req: Request, res: Response) => {
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

export const createContainer = async (req: Request, res: Response) => {
  const { name, color, icon } = req.body;

  if (req.file) {
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
    return;
  }

  const url = req.body.cover;

  if (url) {
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
  } else {
    const container = await containersService.createContainer(
      req.pb,
      name,
      color,
      icon,
    );

    successWithBaseResponse(res, container, 201);
  }
};

export const updateContainer = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, color, icon } = req.body;

  if (!(await checkExistence(req, res, "idea_box_containers", id))) {
    if (req.file) fs.unlinkSync(req.file.path);
    return;
  }

  if (req.file) {
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
    return;
  }

  const url = req.body.cover;

  if (url === "keep") {
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
  } else if (url) {
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
  } else {
    const container = await containersService.updateContainer(
      req.pb,
      id,
      name,
      color,
      icon,
    );

    successWithBaseResponse(res, container);
  }
};

export const deleteContainer = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!(await checkExistence(req, res, "idea_box_containers", id))) {
    return;
  }

  await containersService.deleteContainer(req.pb, id);
  successWithBaseResponse(res, undefined, 204);
};
