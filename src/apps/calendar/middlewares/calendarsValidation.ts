import { body, param } from "express-validator";

export const validateId = [param("id").notEmpty()];

export const validateCalendarData = [
  body("name").isString().notEmpty().trim(),
  body("color").isHexColor(),
];
