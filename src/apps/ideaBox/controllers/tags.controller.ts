import { z } from "zod/v4";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import { checkExistence } from "@utils/PBRecordValidator";
import { successWithBaseResponse } from "@utils/response";
import { forgeController } from "@utils/zodifiedHandler";

import * as tagsService from "../services/tags.service";
import { IdeaBoxTagSchema } from "../typescript/ideabox_interfaces";

export const getTags = forgeController(
  {
    params: z.object({
      container: z.string(),
    }),
    response: z.array(WithPBSchema(IdeaBoxTagSchema)),
  },
  async ({ pb, params: { container } }) =>
    await tagsService.getTags(pb, container),
  {
    existenceCheck: {
      params: {
        container: "idea_box_containers",
      },
    },
  },
);

export const createTag = forgeController(
  {
    body: IdeaBoxTagSchema,
    params: z.object({
      container: z.string(),
    }),
    response: WithPBSchema(IdeaBoxTagSchema),
  },
  async ({ pb, params: { container }, body }) =>
    await tagsService.createTag(pb, container, body),
  {
    existenceCheck: {
      params: {
        container: "idea_box_containers",
      },
    },
    statusCode: 201,
  },
);

export const updateTag = forgeController(
  {
    body: IdeaBoxTagSchema,
    params: z.object({
      id: z.string(),
    }),
    response: WithPBSchema(IdeaBoxTagSchema),
  },
  async ({ pb, params: { id }, body }) =>
    await tagsService.updateTag(pb, id, body),
  {
    existenceCheck: {
      params: {
        id: "idea_box_tags",
      },
    },
  },
);

export const deleteTag = forgeController(
  {
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  },
  async ({ pb, params: { id } }) => await tagsService.deleteTag(pb, id),
  {
    existenceCheck: {
      params: {
        id: "idea_box_tags",
      },
    },
    statusCode: 204,
  },
);
