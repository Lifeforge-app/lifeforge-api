import { body, query } from "express-validator";
import { ITodoSubtask } from "../../../interfaces/todo_list_interfaces";

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
  body("subtasks").custom((value: ITodoSubtask[], meta) => {
    if (!Array.isArray(value)) {
      throw new Error("Invalid value");
    }

    for (const task of value) {
      if (typeof task.title !== "string") {
        throw new Error("Invalid value");
      }
    }
    return true;
  }),
  body("list").isString().optional(),
  body("priority").isString().optional(),
  body("tags").isArray().optional(),
];

export const updateEntryValidation = [
  body("summary").isString(),
  body("notes").isString(),
  body("due_date").isString(),
  body("subtasks").custom((value: ITodoSubtask[], meta) => {
    if (!Array.isArray(value)) {
      throw new Error("Invalid value");
    }

    for (const task of value) {
      if (
        typeof task.title !== "string" ||
        (task.id && task.hasChanged === undefined)
      ) {
        throw new Error("Invalid value");
      }
    }
    return true;
  }),
  body("list").isString().optional(),
  body("priority").isString().optional(),
  body("tags").isArray().optional(),
];
