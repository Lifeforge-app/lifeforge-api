import { param, body } from "express-validator";

/**
 * Validate ID parameter
 */
export const validateId = [
  param("id").notEmpty().withMessage("ID is required"),
];

/**
 * Validate category data
 */
export const validateCategoryData = [
  body("name")
    .isString()
    .withMessage("Category name must be a string")
    .notEmpty()
    .withMessage("Category name is required"),

  body("icon")
    .isString()
    .withMessage("Icon must be a string")
    .notEmpty()
    .withMessage("Icon is required"),

  body("color")
    .isString()
    .withMessage("Color must be a string")
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Color must be a valid hex color code (e.g. #FF0000)"),
];
