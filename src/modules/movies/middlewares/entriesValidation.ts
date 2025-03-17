import { param } from "express-validator";

export const validateTMDBId = [param("id").isInt({ min: 1 })];

export const validateEntryId = [param("id").isString()];
