import { z } from "zod/v4";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import { forgeController } from "@utils/forgeController";

import * as entriesService from "../services/entries.service";
import {
  TodoListEntrySchema,
  TodoListStatusCounterSchema,
} from "../typescript/todo_list_interfaces";

export const getEntryById = forgeController(
  {
    params: z.object({
      id: z.string(),
    }),
    response: WithPBSchema(TodoListEntrySchema),
  },
  async ({ pb, params: { id } }) => await entriesService.getEntryById(pb, id),
  {
    existenceCheck: {
      params: {
        id: "todo_entries",
      },
    },
  },
);

export const getAllEntries = forgeController(
  {
    query: z.object({
      list: z.string().optional(),
      status: z.string().optional().default("all"),
      priority: z.string().optional(),
      tag: z.string().optional(),
      query: z.string().optional(),
    }),
    response: z.array(WithPBSchema(TodoListEntrySchema)),
  },
  async ({ pb, query: { status, tag, list, priority } }) =>
    await entriesService.getAllEntries(pb, status, tag, list, priority),
  {
    existenceCheck: {
      query: {
        tag: "[todo_tags]",
        list: "[todo_lists]",
        priority: "[todo_priorities]",
      },
    },
  },
);

export const getStatusCounter = forgeController(
  {
    response: TodoListStatusCounterSchema,
  },
  async ({ pb }) => await entriesService.getStatusCounter(pb),
);

export const createEntry = forgeController(
  {
    body: TodoListEntrySchema.omit({
      completed_at: true,
    }),
    response: WithPBSchema(TodoListEntrySchema),
  },
  async ({ pb, body }) => await entriesService.createEntry(pb, body),
  {
    existenceCheck: {
      body: {
        list: "[todo_lists]",
        priority: "[todo_priorities]",
        tags: "[todo_tags]",
      },
    },
    statusCode: 201,
  },
);

export const updateEntry = forgeController(
  {
    params: z.object({
      id: z.string(),
    }),
    body: TodoListEntrySchema.omit({
      completed_at: true,
    }),
    response: WithPBSchema(TodoListEntrySchema),
  },
  async ({ pb, params: { id }, body }) =>
    await entriesService.updateEntry(pb, id, body),
  {
    existenceCheck: {
      params: {
        id: "todo_entries",
      },
      body: {
        list: "[todo_lists]",
        priority: "[todo_priorities]",
        tags: "[todo_tags]",
      },
    },
  },
);

export const deleteEntry = forgeController(
  {
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  },
  async ({ pb, params: { id } }) => await entriesService.deleteEntry(pb, id),
  {
    existenceCheck: {
      params: {
        id: "todo_entries",
      },
    },
    statusCode: 204,
  },
);

export const toggleEntry = forgeController(
  {
    params: z.object({
      id: z.string(),
    }),
    response: WithPBSchema(TodoListEntrySchema),
  },
  async ({ pb, params: { id } }) => await entriesService.toggleEntry(pb, id),
  {
    existenceCheck: {
      params: {
        id: "todo_entries",
      },
    },
  },
);
