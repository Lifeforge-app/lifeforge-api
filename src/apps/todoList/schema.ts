// This file is auto-generated. DO NOT EDIT IT MANUALLY.
// Generated for module: todoList
// Generated at: 2025-07-09T11:52:26.853Z
// Contains: todo_list__lists, todo_list__tags, todo_list__entries, todo_list__priorities, todo_list__lists_aggregated, todo_list__tags_aggregated, todo_list__priorities_aggregated
import { z } from "zod/v4";

const TodoListListsSchema = z.object({
  name: z.string(),
  icon: z.string(),
  color: z.string(),
});

const TodoListTagsSchema = z.object({
  name: z.string(),
  amount: z.number(),
});

const TodoListEntriesSchema = z.object({
  summary: z.string(),
  notes: z.string(),
  due_date: z.string(),
  due_date_has_time: z.boolean(),
  list: z.string(),
  tags: z.string(),
  priority: z.string(),
  done: z.boolean(),
  completed_at: z.string(),
});

const TodoListPrioritiesSchema = z.object({
  name: z.string(),
  color: z.string(),
  amount: z.number(),
});

const TodoListListsAggregatedSchema = z.object({
  name: z.string(),
  color: z.string(),
  icon: z.string(),
  amount: z.number(),
});

const TodoListTagsAggregatedSchema = z.object({
  name: z.string(),
  amount: z.number(),
});

const TodoListPrioritiesAggregatedSchema = z.object({
  name: z.string(),
  color: z.string(),
  amount: z.number(),
});

type ITodoListLists = z.infer<typeof TodoListListsSchema>;
type ITodoListTags = z.infer<typeof TodoListTagsSchema>;
type ITodoListEntries = z.infer<typeof TodoListEntriesSchema>;
type ITodoListPriorities = z.infer<typeof TodoListPrioritiesSchema>;
type ITodoListListsAggregated = z.infer<typeof TodoListListsAggregatedSchema>;
type ITodoListTagsAggregated = z.infer<typeof TodoListTagsAggregatedSchema>;
type ITodoListPrioritiesAggregated = z.infer<
  typeof TodoListPrioritiesAggregatedSchema
>;

export {
  TodoListListsSchema,
  TodoListTagsSchema,
  TodoListEntriesSchema,
  TodoListPrioritiesSchema,
  TodoListListsAggregatedSchema,
  TodoListTagsAggregatedSchema,
  TodoListPrioritiesAggregatedSchema,
};

export type {
  ITodoListLists,
  ITodoListTags,
  ITodoListEntries,
  ITodoListPriorities,
  ITodoListListsAggregated,
  ITodoListTagsAggregated,
  ITodoListPrioritiesAggregated,
};
