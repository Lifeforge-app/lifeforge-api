import { body } from "express-validator";

export const createOrUpdateListValidation = [
  body("name").isString(),
  body("icon").isString(),
  body("color").isHexColor(),
];
