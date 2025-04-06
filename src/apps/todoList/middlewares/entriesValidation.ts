import { body, query } from "express-validator";

export const getEntriesValidation = [
  query("status")
    .optional()
    .isIn(["all", "today", "scheduled", "overdue", "completed"]),
  query("tag").isString().optional(),
  query("list").isString().optional(),
  query("priority").isString().optional(),
];

export const createEntryValidation = [
  body("summary").isString(),
  body("notes").isString(),
  body("due_date").isString(),
  body("subtasks").isArray(),
  body("list").isString().optional(),
  body("priority").isString().optional(),
  body("tags").isArray().optional(),
];

export const updateEntryValidation = [
  body("summary").isString(),
  body("notes").isString(),
  body("due_date").isString(),
  body("subtasks").isArray(),
  body("list").isString().optional(),
  body("priority").isString().optional(),
  body("tags").isArray().optional(),
];
