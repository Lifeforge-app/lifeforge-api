import { body, param, query } from "express-validator";

export const getEntriesValidation = [query("master").isString()];

export const checkKeysValidation = [query("keys").isString()];

export const getEntryByIdValidation = [
  param("id").isString(),
  query("master").isString(),
];

export const createEntryValidation = [body("data").isString()];

export const updateEntryValidation = [
  param("id").isString(),
  body("data").isString(),
];

export const deleteEntryValidation = [param("id").isString()];
