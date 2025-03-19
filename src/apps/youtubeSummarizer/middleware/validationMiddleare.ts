import { param } from "express-validator";

export const validateYoutubeID = [
  param("id").isString().isLength({ min: 11, max: 11 }),
];
