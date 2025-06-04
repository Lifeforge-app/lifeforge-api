import { z } from "zod";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import { zodHandler } from "@utils/asyncWrapper";

import * as listsService from "../services/lists.service";
import { TodoListListSchema } from "../typescript/todo_list_interfaces";

export const getAllLists = zodHandler(
  {
    response: z.array(
      WithPBSchema(TodoListListSchema.extend({ amount: z.number() })),
    ),
  },
  ({ pb }) => listsService.getAllLists(pb),
);

export const createList = zodHandler(
  {
    body: TodoListListSchema.pick({ name: true, icon: true, color: true }),
    response: WithPBSchema(TodoListListSchema.extend({ amount: z.number() })),
  },
  ({ pb, body }) => listsService.createList(pb, body),
  {
    statusCode: 201,
  },
);

export const updateList = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    body: TodoListListSchema.pick({ name: true, icon: true, color: true }),
    response: WithPBSchema(TodoListListSchema.extend({ amount: z.number() })),
  },
  ({ pb, params: { id }, body }) => listsService.updateList(pb, id, body),
  {
    existenceCheck: {
      params: {
        id: "todo_lists",
      },
    },
  },
);

export const deleteList = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  },
  ({ pb, params: { id } }) => listsService.deleteList(pb, id),
  {
    existenceCheck: {
      params: {
        id: "todo_lists",
      },
    },
    statusCode: 204,
  },
);
