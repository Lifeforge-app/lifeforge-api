import { body, param } from "express-validator";

export const validateBodyData = [
  body("name").trim().notEmpty(),
  body("icon").trim().notEmpty(),
  body("color").isHexColor(),
];

export const validateId = param("id").isString();
