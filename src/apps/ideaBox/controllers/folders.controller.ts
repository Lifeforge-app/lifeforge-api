import ClientError from "@functions/ClientError";
import { forgeController } from "@functions/forgeController";
import { z } from "zod/v4";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import * as foldersService from "../services/folders.service";
import { IdeaBoxFolderSchema } from "../typescript/ideabox_interfaces";

export const getFolders = forgeController(
  {
    params: z.object({
      container: z.string(),
      "0": z.string(),
    }),
    response: z.array(WithPBSchema(IdeaBoxFolderSchema)),
  },
  async ({ pb, params }) => {
    const { container } = params;
    const path = params[0].split("/").filter((p) => p !== "");

    const { folderExists, lastFolder } =
      await foldersService.validateFolderPath(pb, container, path);

    if (!folderExists) {
      throw new ClientError(
        `Folder with path "${params[0]}" does not exist in container "${container}"`,
      );
    }

    return await foldersService.getFolders(pb, container, lastFolder);
  },
  {
    existenceCheck: {
      params: {
        container: "idea_box_containers",
      },
    },
  },
);

export const createFolder = forgeController(
  {
    body: z.object({
      name: z.string(),
      container: z.string(),
      parent: z.string(),
      icon: z.string(),
      color: z.string(),
    }),
    response: WithPBSchema(IdeaBoxFolderSchema),
  },
  async ({ pb, body }) => await foldersService.createFolder(pb, body),
  {
    statusCode: 201,
    existenceCheck: {
      body: {
        container: "idea_box_containers",
      },
    },
  },
);

export const updateFolder = forgeController(
  {
    params: z.object({
      id: z.string(),
    }),
    body: z.object({
      name: z.string(),
      icon: z.string(),
      color: z.string(),
    }),
    response: WithPBSchema(IdeaBoxFolderSchema),
  },
  async ({ pb, params: { id }, body }) =>
    await foldersService.updateFolder(pb, id, body),
  {
    existenceCheck: {
      params: {
        id: "idea_box_folders",
      },
    },
  },
);

export const moveFolder = forgeController(
  {
    params: z.object({
      id: z.string(),
    }),
    query: z.object({
      target: z.string(),
    }),
    response: WithPBSchema(IdeaBoxFolderSchema),
  },
  async ({ pb, params: { id }, query: { target } }) =>
    await foldersService.moveFolder(pb, id, target),
  {
    existenceCheck: {
      params: {
        id: "idea_box_folders",
      },
      query: {
        target: "idea_box_folders",
      },
    },
  },
);

export const removeFromFolder = forgeController(
  {
    params: z.object({
      id: z.string(),
    }),
    response: WithPBSchema(IdeaBoxFolderSchema),
  },
  async ({ pb, params: { id } }) =>
    await foldersService.removeFromFolder(pb, id),
  {
    existenceCheck: {
      params: {
        id: "idea_box_folders",
      },
    },
  },
);

export const deleteFolder = forgeController(
  {
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  },
  async ({ pb, params: { id } }) => await foldersService.deleteFolder(pb, id),
  {
    existenceCheck: {
      params: {
        id: "idea_box_folders",
      },
    },
    statusCode: 204,
  },
);
