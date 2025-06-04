import { z } from "zod/v4";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import { forgeController } from "@utils/zodifiedHandler";

import * as prioritiesService from "../services/priorities.service";
import { TodoListPrioritySchema } from "../typescript/todo_list_interfaces";

export const getAllPriorities = forgeController(
  {
    response: z.array(
      WithPBSchema(TodoListPrioritySchema.extend({ amount: z.number() })),
    ),
  },
  ({ pb }) => prioritiesService.getAllPriorities(pb),
);

export const createPriority = forgeController(
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

export const updatePriority = forgeController(
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

export const deletePriority = forgeController(
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
