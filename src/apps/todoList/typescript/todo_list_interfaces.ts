import { z } from "zod/v4";

const TodoListEntrySchema = z.object({
  due_date: z.string(),
  due_date_has_time: z.boolean().optional(),
  list: z.string(),
  notes: z.string(),
  priority: z.string(),
  summary: z.string(),
  tags: z.array(z.string()),
  done: z.boolean(),
  completed_at: z.string(),
});

const TodoListListSchema = z.object({
  color: z.string(),
  icon: z.string(),
  name: z.string(),
});

const TodoListPrioritySchema = z.object({
  color: z.string(),
  name: z.string(),
});

const TodoListTagSchema = z.object({
  color: z.string(),
  name: z.string(),
});

const TodoListStatusCounterSchema = z.object({
  all: z.number(),
  today: z.number(),
  scheduled: z.number(),
  overdue: z.number(),
  completed: z.number(),
});

type ITodoListEntry = z.infer<typeof TodoListEntrySchema>;
type ITodoListList = z.infer<typeof TodoListListSchema>;
type ITodoListPriority = z.infer<typeof TodoListPrioritySchema>;
type ITodoListTag = z.infer<typeof TodoListTagSchema>;
type ITodoListStatusCounter = z.infer<typeof TodoListStatusCounterSchema>;

export {
  TodoListEntrySchema,
  TodoListListSchema,
  TodoListPrioritySchema,
  TodoListTagSchema,
  TodoListStatusCounterSchema,
};

export type {
  ITodoListEntry,
  ITodoListList,
  ITodoListStatusCounter,
  ITodoListTag,
  ITodoListPriority,
};
