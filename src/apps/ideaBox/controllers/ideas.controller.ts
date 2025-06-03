import fs from "fs";
import { z } from "zod";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import ClientError from "@utils/ClientError";
import { checkExistence } from "@utils/PBRecordValidator";
import { zodHandler } from "@utils/asyncWrapper";
import { clientError, successWithBaseResponse } from "@utils/response";

import * as ideasService from "../services/ideas.service";
import {
  IIdeaBoxEntry,
  IdeaBoxEntrySchema,
} from "../typescript/ideabox_interfaces";

export const getIdeas = zodHandler(
  {
    params: z.object({
      container: z.string(),
      "0": z.string(),
    }),
    query: z.object({
      archived: z
        .string()
        .optional()
        .transform((val) => val === "true"),
    }),
    response: z.array(WithPBSchema(IdeaBoxEntrySchema)),
  },
  async ({ pb, params, query }) => {
    const path = params[0].split("/").filter((e) => e);
    const { container } = params;

    const { folderExists, lastFolder } = await ideasService.validateFolderPath(
      pb,
      container,
      path,
    );

    if (!folderExists) {
      throw new ClientError(
        `Folder with path "${params[0]}" does not exist in container "${container}"`,
      );
    }

    return await ideasService.getIdeas(
      pb,
      container,
      lastFolder,
      query.archived,
    );
  },
  {
    existenceCheck: {
      params: {
        container: "idea_box_containers",
      },
    },
  },
);

export const createIdea = zodHandler(
  {
    body: z.object({
      container: z.string(),
      title: z.string().optional(),
      content: z.string().optional(),
      type: z.enum(["text", "link", "image"]),
      imageLink: z.string().optional(),
      folder: z.string(),
      tags: z.array(z.string()),
    }),
    response: WithPBSchema(IdeaBoxEntrySchema),
  },
  async ({ pb, body, res, req }) => {
    const { container, title, content, type, imageLink, folder, tags } = body;
    const { file } = req;

    let data: Omit<IIdeaBoxEntry, "image" | "archived" | "pinned"> & {
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
            throw new ClientError(
              "Image file is required for image type ideas",
            );
          }

          data["image"] = new File([file.buffer], file.originalname, {
            type: file.mimetype,
          });
          data["title"] = title;
        }
        break;
    }

    return await ideasService.createIdea(pb, data);
  },
  {
    statusCode: 201,
    existenceCheck: {
      body: {
        container: "idea_box_containers",
      },
    },
  },
);

export const updateIdea = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    body: z.object({
      title: z.string().optional(),
      content: z.string().optional(),
      type: z.enum(["text", "link", "image"]),
      tags: z.array(z.string()).optional(),
    }),
    response: WithPBSchema(IdeaBoxEntrySchema),
  },
  async ({ pb, params, body }) => {
    const { id } = params;
    const { title, content, type, tags } = body;

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

    return await ideasService.updateIdea(pb, id, data as any);
  },
  {
    existenceCheck: {
      params: {
        id: "idea_box_entries",
      },
    },
  },
);

export const deleteIdea = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  },
  async ({ pb, params }) => await ideasService.deleteIdea(pb, params.id),
  {
    existenceCheck: {
      params: {
        id: "idea_box_entries",
      },
    },
    statusCode: 204,
  },
);

export const pinIdea = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: WithPBSchema(IdeaBoxEntrySchema),
  },
  async ({ pb, params }) => await ideasService.updatePinStatus(pb, params.id),
  {
    existenceCheck: {
      params: {
        id: "idea_box_entries",
      },
    },
  },
);

export const archiveIdea = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: WithPBSchema(IdeaBoxEntrySchema),
  },
  async ({ pb, params }) =>
    await ideasService.updateArchiveStatus(pb, params.id),
  {
    existenceCheck: {
      params: {
        id: "idea_box_entries",
      },
    },
  },
);

export const moveIdea = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    query: z.object({
      target: z.string(),
    }),
    response: WithPBSchema(IdeaBoxEntrySchema),
  },
  async ({ pb, params, query }) =>
    await ideasService.moveIdea(pb, params.id, query.target),
  {
    existenceCheck: {
      params: {
        id: "idea_box_entries",
      },
      query: {
        target: "idea_box_folders",
      },
    },
  },
);

export const removeFromFolder = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: WithPBSchema(IdeaBoxEntrySchema),
  },
  async ({ pb, params }) => await ideasService.removeFromFolder(pb, params.id),
  {
    existenceCheck: {
      params: {
        id: "idea_box_entries",
      },
    },
  },
);
