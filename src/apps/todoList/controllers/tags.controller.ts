import { forgeController } from "@functions/forgeController";
import { z } from "zod/v4";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import * as tagsService from "../services/tags.service";
import { TodoListTagSchema } from "../typescript/todo_list_interfaces";

export const getAllTags = forgeController(
  {
    response: z.array(
      WithPBSchema(TodoListTagSchema.extend({ amount: z.number() })),
    ),
  },
  ({ pb }) => tagsService.getAllTags(pb),
);

export const createTag = forgeController(
  {
    body: TodoListTagSchema.pick({ name: true, color: true }),
    response: WithPBSchema(TodoListTagSchema.extend({ amount: z.number() })),
  },
  ({ pb, body }) => tagsService.createTag(pb, body),
  {
    statusCode: 201,
  },
);

export const updateTag = forgeController(
  {
    params: z.object({
      id: z.string(),
    }),
    body: TodoListTagSchema.pick({ name: true, color: true }),
    response: WithPBSchema(TodoListTagSchema.extend({ amount: z.number() })),
  },
  ({ pb, params: { id }, body }) => tagsService.updateTag(pb, id, body),
  {
    existenceCheck: {
      params: {
        id: "todo_tags",
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
  ({ pb, params: { id } }) => tagsService.deleteTag(pb, id),
  {
    existenceCheck: {
      params: {
        id: "todo_tags",
      },
    },
    statusCode: 204,
  },
);
