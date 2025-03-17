import { query } from "express-validator";

export const searchMovieValidation = [
  query("q").isString(),
  query("page").isInt({ min: 1 }),
];
