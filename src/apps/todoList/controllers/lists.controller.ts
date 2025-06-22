import {
  bulkRegisterControllers,
  forgeController,
} from "@functions/newForgeController";
import express from "express";
import { z } from "zod/v4";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import * as listsService from "../services/lists.service";
import { TodoListListSchema } from "../typescript/todo_list_interfaces";

const todoListListsRouter = express.Router();

const getAllLists = forgeController
  .route("GET /")
  .description("Get all todo lists")
  .schema({
    response: z.array(
      WithPBSchema(TodoListListSchema.extend({ amount: z.number() })),
    ),
  })
  .callback(({ pb }) => listsService.getAllLists(pb));

const createList = forgeController
  .route("POST /")
  .description("Create a new todo list")
  .schema({
    body: TodoListListSchema.pick({ name: true, icon: true, color: true }),
    response: WithPBSchema(TodoListListSchema.extend({ amount: z.number() })),
  })
  .statusCode(201)
  .callback(({ pb, body }) => listsService.createList(pb, body));

const updateList = forgeController
  .route("PATCH /:id")
  .description("Update an existing todo list")
  .schema({
    params: z.object({
      id: z.string(),
    }),
    body: TodoListListSchema.pick({ name: true, icon: true, color: true }),
    response: WithPBSchema(TodoListListSchema.extend({ amount: z.number() })),
  })
  .existenceCheck("params", {
    id: "todo_lists",
  })
  .callback(({ pb, params: { id }, body }) =>
    listsService.updateList(pb, id, body),
  );

const deleteList = forgeController
  .route("DELETE /:id")
  .description("Delete a todo list")
  .schema({
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  })
  .existenceCheck("params", {
    id: "todo_lists",
  })
  .statusCode(204)
  .callback(({ pb, params: { id } }) => listsService.deleteList(pb, id));

bulkRegisterControllers(todoListListsRouter, [
  getAllLists,
  createList,
  updateList,
  deleteList,
]);

export default todoListListsRouter;
