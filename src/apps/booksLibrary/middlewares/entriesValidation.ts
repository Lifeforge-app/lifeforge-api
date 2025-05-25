import { body, param } from "express-validator";

export const validateBodyData = [
  body("authors").isString(),
  body("category").isString().optional(),
  body("edition").isString(),
  body("isbn").isString(),
  body("languages").isArray(),
  body("publisher").isString(),
  body("title").isString(),
  body("year_published").isNumeric(),
];

export const validateBodyEmail = body("target").isEmail();

export const validateId = param("id").isString();
