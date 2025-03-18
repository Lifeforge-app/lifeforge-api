import { body, param, query } from "express-validator";

export const validateGetEntries = [
  query("page").isNumeric().toInt(),
  query("query").optional().isString(),
  query("category").optional().isString(),
  query("author").optional().isString(),
  query("starred").optional().isBoolean().toBoolean(),
  query("sort").optional().isIn(["name", "author", "newest", "oldest"]),
];

export const validateUpdateEntry = [
  param("id").exists().notEmpty(),
  body("name").isString(),
  body("author").isString(),
  body("type").optional().isIn(["fingerstyle", "singalong"]),
];

export const validateDeleteEntry = [param("id").exists().notEmpty()];

export const validateToggleFavorite = [param("id").exists().notEmpty()];

export const validateGetTabsList = [
  body("cookie").exists().notEmpty(),
  body("page").isNumeric(),
];

export const validateDownloadTab = [
  body("cookie").exists().notEmpty(),
  body("id").exists().notEmpty(),
  body("name").exists().notEmpty(),
  body("category").exists().notEmpty(),
  body("mainArtist").exists().notEmpty(),
  body("audioUrl").exists().notEmpty(),
];
