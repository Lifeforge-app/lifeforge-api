import fs from "fs";
import { z } from "zod";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import { zodHandler } from "@utils/asyncWrapper";

import * as containersService from "../services/containers.service";
import { IdeaBoxContainerSchema } from "../typescript/ideabox_interfaces";

export const checkContainerExists = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: z.boolean(),
  },
  async ({ pb, params }) =>
    await containersService.checkContainerExists(pb, params.id),
);

export const getContainers = zodHandler(
  {
    response: z.array(WithPBSchema(IdeaBoxContainerSchema)),
  },
  async ({ pb }) =>
    (await containersService.getContainers(pb)).map((container) => ({
      ...container,
      cover: container.cover
        ? pb.files
            .getURL(container, container.cover)
            .replace(`${pb.baseURL}/api/files`, "")
        : "",
    })),
);

export const createContainer = zodHandler(
  {
    body: z.object({
      name: z.string(),
      color: z.string(),
      icon: z.string(),
      cover: z.string().optional(),
    }),
    response: WithPBSchema(IdeaBoxContainerSchema),
  },
  async ({ pb, body, req, res }) => {
    const { name, color, icon } = body;

    const container = await containersService.createContainer(
      pb,
      name,
      color,
      icon,
      await (async () => {
        if (req.file) {
          return new File([fs.readFileSync(req.file.path)], req.file.filename);
        }

        const url = body.cover;
        if (url) {
          const response = await fetch(url);
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

export const updateContainer = zodHandler(
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
  async ({ pb, params, body, req }) => {
    const { name, color, icon } = body;

    const container = await containersService.updateContainer(
      pb,
      params.id,
      name,
      color,
      icon,
      await (async () => {
        if (req.file) {
          return new File([fs.readFileSync(req.file.path)], req.file.filename);
        }

        const url = body.cover;

        if (url === "keep") {
          return "keep";
        }

        if (url) {
          const response = await fetch(url);
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

export const deleteContainer = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  },
  async ({ pb, params }) => containersService.deleteContainer(pb, params.id),
  {
    existenceCheck: {
      params: {
        id: "idea_box_containers",
      },
    },
    statusCode: 204,
  },
);
