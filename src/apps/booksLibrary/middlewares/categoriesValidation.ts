import { body, param } from "express-validator";

export const validateId = [param("id").isString().notEmpty()];

export const validateBodyData = [
  body("name").isString().notEmpty(),
  body("icon").isString().notEmpty(),
];
