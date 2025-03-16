import { body, param } from "express-validator";

export const validateId = [
  param("id").notEmpty().withMessage("Language ID is required"),
];

export const validateBodyData = [
  body("name").notEmpty().isString(),
  body("icon").notEmpty().isString(),
];
