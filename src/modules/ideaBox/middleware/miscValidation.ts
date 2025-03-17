import { param, query } from "express-validator";

export const validateGetPath = [param("container").isString()];

export const validateCheckValid = [param("container").isString()];

export const validateGetOgData = [param("id").isString()];

export const validateSearch = [
  query("q").isString().trim(),
  query("tags").isString().optional().trim(),
  query("container").isString().optional().trim(),
  query("folder").isString().optional().trim(),
];
