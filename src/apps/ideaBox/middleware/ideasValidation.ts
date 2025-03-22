import { body, param, query } from "express-validator";

export const validateGetIdeas = [
  query("archived").isBoolean().optional(),
  param("container").isString(),
];

export const validateCreateIdea = [
  body("container").isString(),
  body("title").isString().optional(),
  body("content").custom((value, { req }) => {
    if (req.body.type === "image") return true;
    if (typeof value !== "string" || !value) {
      throw new Error("Invalid value");
    }
    return true;
  }),
  body("type").isString().isIn(["text", "link", "image"]).notEmpty(),
  body("imageLink").custom((value, { req }) => {
    if (req.body.type !== "image" && value) {
      throw new Error("Invalid value");
    }
    return true;
  }),
  body("folder").isString().optional(),
  body("file").custom((_, { req }) => {
    if (req.body.type === "image" && !req.file && !req.body.imageLink) {
      throw new Error("Image is required");
    }
    return true;
  }),
  body("tags").isString().optional(),
];

export const validateUpdateIdea = [
  param("id").isString(),
  body("title").isString(),
  body("content").isString(),
  body("type").isIn(["text", "link", "image"]),
  body("tags").isArray().optional(),
];

export const validatePinIdea = [param("id").isString()];

export const validateArchiveIdea = [param("id").isString()];

export const validateMoveIdea = [
  param("id").isString(),
  query("target").isString(),
];

export const validateRemoveFromFolder = [param("id").isString()];

export const validateDeleteIdea = [param("id").isString()];
