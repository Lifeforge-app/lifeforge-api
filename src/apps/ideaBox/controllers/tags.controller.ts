import { z } from "zod";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import { checkExistence } from "@utils/PBRecordValidator";
import { zodHandler } from "@utils/asyncWrapper";
import { successWithBaseResponse } from "@utils/response";

import * as tagsService from "../services/tags.service";
import { IdeaBoxTagSchema } from "../typescript/ideabox_interfaces";

export const getTags = zodHandler(
  {
    params: z.object({
      container: z.string(),
    }),
    response: z.array(WithPBSchema(IdeaBoxTagSchema)),
  },
  async ({ pb, params }) => await tagsService.getTags(pb, params.container),
  {
    existenceCheck: {
      params: {
        container: "idea_box_containers",
      },
    },
  },
);

export const createTag = zodHandler(
  {
    body: IdeaBoxTagSchema,
    params: z.object({
      container: z.string(),
    }),
    response: WithPBSchema(IdeaBoxTagSchema),
  },
  async ({ pb, params, body }) =>
    await tagsService.createTag(pb, params.container, body),
  {
    existenceCheck: {
      params: {
        container: "idea_box_containers",
      },
    },
    statusCode: 201,
  },
);

export const updateTag = zodHandler(
  {
    body: IdeaBoxTagSchema,
    params: z.object({
      id: z.string(),
    }),
    response: WithPBSchema(IdeaBoxTagSchema),
  },
  async ({ pb, params, body }) =>
    await tagsService.updateTag(pb, params.id, body),
  {
    existenceCheck: {
      params: {
        id: "idea_box_tags",
      },
    },
  },
);

export const deleteTag = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  },
  async ({ pb, params }) => await tagsService.deleteTag(pb, params.id),
  {
    existenceCheck: {
      params: {
        id: "idea_box_tags",
      },
    },
    statusCode: 204,
  },
);
