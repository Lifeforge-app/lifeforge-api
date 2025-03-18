import { body } from "express-validator";

export const validateGenerateSubtasks = [
  body("summary").isString(),
  body("notes").optional().isString(),
  body("level").exists().isInt().isIn([0, 1, 2, 3, 4]),
];
