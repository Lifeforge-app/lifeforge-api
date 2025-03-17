import { body } from "express-validator";

export const createOrUpdateTagValidation = [body("name").exists().notEmpty()];
