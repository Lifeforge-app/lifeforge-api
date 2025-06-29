import {
  bulkRegisterControllers,
  forgeController,
} from "@functions/forgeController";
import express from "express";
import { z } from "zod/v4";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import * as prioritiesService from "../services/priorities.service";
import { TodoListPrioritySchema } from "../typescript/todo_list_interfaces";

const todoListPrioritiesRouter = express.Router();

const getAllPriorities = forgeController
  .route("GET /")
  .description("Get all todo priorities")
  .schema({
    response: z.array(
      WithPBSchema(TodoListPrioritySchema.extend({ amount: z.number() })),
    ),
  })
  .callback(({ pb }) => prioritiesService.getAllPriorities(pb));

const createPriority = forgeController
  .route("POST /")
  .description("Create a new todo priority")
  .schema({
    body: TodoListPrioritySchema.pick({ name: true, color: true }),
    response: WithPBSchema(
      TodoListPrioritySchema.extend({ amount: z.number() }),
    ),
  })
  .statusCode(201)
  .callback(({ pb, body }) => prioritiesService.createPriority(pb, body));

const updatePriority = forgeController
  .route("PATCH /:id")
  .description("Update an existing todo priority")
  .schema({
    params: z.object({
      id: z.string(),
    }),
    body: TodoListPrioritySchema.pick({ name: true, color: true }),
    response: WithPBSchema(
      TodoListPrioritySchema.extend({ amount: z.number() }),
    ),
  })
  .existenceCheck("params", {
    id: "todo_priorities",
  })
  .callback(({ pb, params: { id }, body }) =>
    prioritiesService.updatePriority(pb, id, body),
  );

const deletePriority = forgeController
  .route("DELETE /:id")
  .description("Delete a todo priority")
  .schema({
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  })
  .existenceCheck("params", {
    id: "todo_priorities",
  })
  .statusCode(204)
  .callback(({ pb, params: { id } }) =>
    prioritiesService.deletePriority(pb, id),
  );

bulkRegisterControllers(todoListPrioritiesRouter, [
  getAllPriorities,
  createPriority,
  updatePriority,
  deletePriority,
]);

export default todoListPrioritiesRouter;
