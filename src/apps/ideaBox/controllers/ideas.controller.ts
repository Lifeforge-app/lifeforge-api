import fs from "fs";
import { z } from "zod/v4";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import ClientError from "@utils/ClientError";
import { checkExistence } from "@utils/PBRecordValidator";
import { clientError, successWithBaseResponse } from "@utils/response";
import { forgeController } from "@utils/zodifiedHandler";

import * as ideasService from "../services/ideas.service";
import {
  IIdeaBoxEntry,
  IdeaBoxEntrySchema,
} from "../typescript/ideabox_interfaces";

export const getIdeas = forgeController(
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
  async ({
    pb,
    params: { "0": pathParam, container },
    query: { archived },
  }) => {
    const path = pathParam.split("/").filter((e) => e);

    const { folderExists, lastFolder } = await ideasService.validateFolderPath(
      pb,
      container,
      path,
    );

    if (!folderExists) {
      throw new ClientError(
        `Folder with path "${pathParam}" does not exist in container "${container}"`,
      );
    }

    return await ideasService.getIdeas(pb, container, lastFolder, archived);
  },
  {
    existenceCheck: {
      params: {
        container: "idea_box_containers",
      },
    },
  },
);

export const createIdea = forgeController(
  {
    body: IdeaBoxEntrySchema.pick({
      type: true,
      container: true,
      folder: true,
      title: true,
      content: true,
      tags: true,
    }).extend({
      imageLink: z.string().optional(),
    }),
    response: WithPBSchema(IdeaBoxEntrySchema),
  },
  async ({
    pb,
    body: { type, container, folder, title, content, imageLink, tags },
    req,
  }) => {
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

export const updateIdea = forgeController(
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
  async ({ pb, params: { id }, body: { title, content, type, tags } }) => {
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

export const deleteIdea = forgeController(
  {
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  },
  async ({ pb, params: { id } }) => await ideasService.deleteIdea(pb, id),
  {
    existenceCheck: {
      params: {
        id: "idea_box_entries",
      },
    },
    statusCode: 204,
  },
);

export const pinIdea = forgeController(
  {
    params: z.object({
      id: z.string(),
    }),
    response: WithPBSchema(IdeaBoxEntrySchema),
  },
  async ({ pb, params: { id } }) => await ideasService.updatePinStatus(pb, id),
  {
    existenceCheck: {
      params: {
        id: "idea_box_entries",
      },
    },
  },
);

export const archiveIdea = forgeController(
  {
    params: z.object({
      id: z.string(),
    }),
    response: WithPBSchema(IdeaBoxEntrySchema),
  },
  async ({ pb, params: { id } }) =>
    await ideasService.updateArchiveStatus(pb, id),
  {
    existenceCheck: {
      params: {
        id: "idea_box_entries",
      },
    },
  },
);

export const moveIdea = forgeController(
  {
    params: z.object({
      id: z.string(),
    }),
    query: z.object({
      target: z.string(),
    }),
    response: WithPBSchema(IdeaBoxEntrySchema),
  },
  async ({ pb, params: { id }, query: { target } }) =>
    await ideasService.moveIdea(pb, id, target),
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

export const removeFromFolder = forgeController(
  {
    params: z.object({
      id: z.string(),
    }),
    response: WithPBSchema(IdeaBoxEntrySchema),
  },
  async ({ pb, params: { id } }) => await ideasService.removeFromFolder(pb, id),
  {
    existenceCheck: {
      params: {
        id: "idea_box_entries",
      },
    },
  },
);
