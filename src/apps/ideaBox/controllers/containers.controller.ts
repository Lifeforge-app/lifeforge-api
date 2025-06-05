import fs from "fs";
import { z } from "zod/v4";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import { forgeController } from "@utils/forgeController";

import * as containersService from "../services/containers.service";
import { IdeaBoxContainerSchema } from "../typescript/ideabox_interfaces";

export const checkContainerExists = forgeController(
  {
    params: z.object({
      id: z.string(),
    }),
    response: z.boolean(),
  },
  async ({ pb, params: { id } }) =>
    await containersService.checkContainerExists(pb, id),
);

export const getContainers = forgeController(
  {
    response: z.array(WithPBSchema(IdeaBoxContainerSchema)),
  },
  async ({ pb }) => await containersService.getContainers(pb),
);

export const createContainer = forgeController(
  {
    body: IdeaBoxContainerSchema,
    response: WithPBSchema(IdeaBoxContainerSchema),
  },
  async ({ pb, body: { name, color, icon, cover }, req }) => {
    const container = await containersService.createContainer(
      pb,
      name,
      color,
      icon,
      await (async () => {
        if (req.file) {
          return new File([fs.readFileSync(req.file.path)], req.file.filename);
        }

        if (cover) {
          const response = await fetch(cover);
          const fileBuffer = await response.arrayBuffer();

          return new File([fileBuffer], "cover.jpg");
        }

        return undefined;
      })(),
    );

    if (container.cover) {
      container.cover = pb.files
        .getURL(container, container.cover)
        .replace(`${pb.baseURL}/api/files`, "");
    }

    if (req.file) {
      fs.unlinkSync(req.file.path);
    }

    return container;
  },
  {
    statusCode: 201,
  },
);

export const updateContainer = forgeController(
  {
    params: z.object({
      id: z.string(),
    }),
    body: z.object({
      name: z.string(),
      color: z.string(),
      icon: z.string(),
      cover: z.string().optional(),
    }),
    response: WithPBSchema(IdeaBoxContainerSchema),
  },
  async ({ pb, params: { id }, body: { name, icon, color, cover }, req }) => {
    const container = await containersService.updateContainer(
      pb,
      id,
      name,
      color,
      icon,
      await (async () => {
        if (req.file) {
          return new File([fs.readFileSync(req.file.path)], req.file.filename);
        }

        if (cover === "keep") {
          return "keep";
        }

        if (cover) {
          const response = await fetch(cover);
          const fileBuffer = await response.arrayBuffer();

          return new File([fileBuffer], "cover.jpg");
        }

        return undefined;
      })(),
    );

    if (container.cover) {
      container.cover = pb.files
        .getURL(container, container.cover)
        .replace(`${pb.baseURL}/api/files`, "");
    }

    if (req.file) {
      fs.unlinkSync(req.file.path);
    }

    return container;
  },
  {
    existenceCheck: {
      params: {
        id: "idea_box_containers",
      },
    },
  },
);

export const deleteContainer = forgeController(
  {
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  },
  async ({ pb, params: { id } }) => containersService.deleteContainer(pb, id),
  {
    existenceCheck: {
      params: {
        id: "idea_box_containers",
      },
    },
    statusCode: 204,
  },
);
