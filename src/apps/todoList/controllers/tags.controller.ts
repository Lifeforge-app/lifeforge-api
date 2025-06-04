import { z } from "zod";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import { zodHandler } from "@utils/asyncWrapper";

import * as tagsService from "../services/tags.service";
import { TodoListTagSchema } from "../typescript/todo_list_interfaces";

export const getAllTags = zodHandler(
  {
    response: z.array(
      WithPBSchema(TodoListTagSchema.extend({ amount: z.number() })),
    ),
  },
  ({ pb }) => tagsService.getAllTags(pb),
);

export const createTag = zodHandler(
  {
    body: TodoListTagSchema.pick({ name: true, color: true }),
    response: WithPBSchema(TodoListTagSchema.extend({ amount: z.number() })),
  },
  ({ pb, body }) => tagsService.createTag(pb, body),
  {
    statusCode: 201,
  },
);

export const updateTag = zodHandler(
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

export const deleteTag = zodHandler(
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
