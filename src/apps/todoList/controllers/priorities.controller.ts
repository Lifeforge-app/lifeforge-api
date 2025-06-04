import { z } from "zod";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import { zodHandler } from "@utils/asyncWrapper";

import * as prioritiesService from "../services/priorities.service";
import { TodoListPrioritySchema } from "../typescript/todo_list_interfaces";

export const getAllPriorities = zodHandler(
  {
    response: z.array(
      WithPBSchema(TodoListPrioritySchema.extend({ amount: z.number() })),
    ),
  },
  ({ pb }) => prioritiesService.getAllPriorities(pb),
);

export const createPriority = zodHandler(
  {
    body: TodoListPrioritySchema.pick({ name: true, color: true }),
    response: WithPBSchema(
      TodoListPrioritySchema.extend({ amount: z.number() }),
    ),
  },
  ({ pb, body }) => prioritiesService.createPriority(pb, body),
  {
    statusCode: 201,
  },
);

export const updatePriority = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    body: TodoListPrioritySchema.pick({ name: true, color: true }),
    response: WithPBSchema(
      TodoListPrioritySchema.extend({ amount: z.number() }),
    ),
  },
  ({ pb, params: { id }, body }) =>
    prioritiesService.updatePriority(pb, id, body),
  {
    existenceCheck: {
      params: {
        id: "todo_priorities",
      },
    },
  },
);

export const deletePriority = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  },
  ({ pb, params: { id } }) => prioritiesService.deletePriority(pb, id),
  {
    existenceCheck: {
      params: {
        id: "todo_priorities",
      },
    },
    statusCode: 204,
  },
);
