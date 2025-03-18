import { body, param } from "express-validator";

export const validateContainerId = [param("id").exists().notEmpty()];

export const validateCreateContainer = [
  body("name").exists().notEmpty().isString(),
  body("color").exists().notEmpty().isString(),
  body("icon").optional().isString(),
];

export const validateUpdateContainer = [
  param("id").exists().notEmpty(),
  body("name").exists().notEmpty().isString(),
  body("color").exists().notEmpty().isString(),
  body("icon").optional().isString(),
];
