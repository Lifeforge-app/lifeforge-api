import { query } from "express-validator";

export const validateDays = [query("days").isNumeric()];

export const validateLastXDays = [
  query("last").isIn(["24 hours", "7 days", "30 days"]),
];

export const validateMinutes = [query("minutes").isNumeric()];
