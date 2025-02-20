import { body, param } from "express-validator";

export const validateDifficulty = param("difficulty").isIn([
  "easy",
  "medium",
  "hard",
  "impossible",
]);

export const validateBodyData = [
  body("difficulty").isIn(["easy", "medium", "hard", "impossible"]),
  body("title").trim().notEmpty(),
  body("thoughts").trim().notEmpty(),
];

export const validateId = param("id").isString();
