import { body } from "express-validator";

export const createOrUpdatePriorityValidation = [
  body("name").exists().notEmpty(),
  body("color").exists().isHexColor(),
];
