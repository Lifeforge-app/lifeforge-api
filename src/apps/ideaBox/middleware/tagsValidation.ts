import { body, param } from "express-validator";

export const validateGetTags = [param("container").isString()];

export const validateCreateTag = [
  param("container").isString(),
  body("name").isString(),
  body("icon").isString(),
  body("color").isString(),
];

export const validateUpdateTag = [
  param("id").isString(),
  body("name").isString(),
  body("icon").isString(),
  body("color").isString(),
];

export const validateDeleteTag = [param("id").isString()];
