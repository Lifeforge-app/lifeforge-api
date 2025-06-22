import {
  bulkRegisterControllers,
  forgeController,
} from "@functions/newForgeController";
import express from "express";
import { z } from "zod/v4";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import * as tagsService from "../services/tags.service";
import { TodoListTagSchema } from "../typescript/todo_list_interfaces";

const todoListTagsRouter = express.Router();

const getAllTags = forgeController
  .route("GET /")
  .description("Get all todo tags")
  .schema({
    response: z.array(
      WithPBSchema(TodoListTagSchema.extend({ amount: z.number() })),
    ),
  })
  .callback(({ pb }) => tagsService.getAllTags(pb));

const createTag = forgeController
  .route("POST /")
  .description("Create a new todo tag")
  .schema({
    body: TodoListTagSchema.pick({ name: true, color: true }),
    response: WithPBSchema(TodoListTagSchema.extend({ amount: z.number() })),
  })
  .statusCode(201)
  .callback(({ pb, body }) => tagsService.createTag(pb, body));

const updateTag = forgeController
  .route("PATCH /:id")
  .description("Update an existing todo tag")
  .schema({
    params: z.object({
      id: z.string(),
    }),
    body: TodoListTagSchema.pick({ name: true, color: true }),
    response: WithPBSchema(TodoListTagSchema.extend({ amount: z.number() })),
  })
  .existenceCheck("params", {
    id: "todo_tags",
  })
  .callback(({ pb, params: { id }, body }) =>
    tagsService.updateTag(pb, id, body),
  );

const deleteTag = forgeController
  .route("DELETE /:id")
  .description("Delete a todo tag")
  .schema({
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  })
  .existenceCheck("params", {
    id: "todo_tags",
  })
  .statusCode(204)
  .callback(({ pb, params: { id } }) => tagsService.deleteTag(pb, id));

bulkRegisterControllers(todoListTagsRouter, [
  getAllTags,
  createTag,
  updateTag,
  deleteTag,
]);

export default todoListTagsRouter;
