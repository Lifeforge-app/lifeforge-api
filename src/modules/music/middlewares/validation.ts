import { body, param } from "express-validator";

export const validateEntryId = [
  param("id").exists().withMessage("Entry ID is required"),
];

export const validateMusicUpdate = [
  param("id").exists().withMessage("Entry ID is required"),
  body("name").notEmpty().withMessage("Music name is required"),
  body("author").notEmpty().withMessage("Author is required"),
];

export const validateYoutubeDownload = [
  body("metadata").isObject(),
  param("id")
    .isString()
    .matches(/^[a-zA-Z0-9_-]{11}$/),
];
