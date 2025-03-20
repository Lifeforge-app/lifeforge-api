import { body, param } from "express-validator";

export const validateYoutubeID = [
  param("id").isString().isLength({ min: 11, max: 11 }),
];

export const validateURL = [body("url").isURL()];
