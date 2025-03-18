import { body, param, query } from "express-validator";

export const validateGetFolders = [param("container").isString()];

export const validateCreateFolder = [
  body("name").isString(),
  body("container").isString(),
  body("parent").isString(),
  body("icon").isString(),
  body("color").isHexColor(),
];

export const validateUpdateFolder = [
  param("id").exists().notEmpty(),
  body("name").isString(),
  body("icon").isString(),
  body("color").isHexColor(),
];

export const validateMoveFolder = [
  param("id").exists().notEmpty(),
  query("target").isString(),
];

export const validateRemoveFromFolder = [param("id").exists().notEmpty()];

export const validateDeleteFolder = [param("id").exists().notEmpty()];
