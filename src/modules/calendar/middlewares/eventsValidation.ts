import { body, param, query } from "express-validator";

export const validateYearMonth = [
  query("start")
    .exists()
    .withMessage("Start date is required")
    .isString()
    .withMessage("Start date must be a string"),
  query("end")
    .exists()
    .withMessage("End date is required")
    .isString()
    .withMessage("End date must be a string"),
];

export const validateEventData = [
  body("title")
    .exists()
    .withMessage("Title is required")
    .isString()
    .withMessage("Title must be a string")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Title cannot be empty"),
  body("start").exists().withMessage("Start date is required"),
  body("end").exists().withMessage("End date is required"),
  body("category")
    .exists()
    .withMessage("Category is required")
    .isString()
    .withMessage("Category must be a string")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Category cannot be empty"),
];

export const validateId = [
  param("id")
    .exists()
    .withMessage("ID is required")
    .isString()
    .withMessage("ID must be a string")
    .trim()
    .isLength({ min: 1 })
    .withMessage("ID cannot be empty"),
];
