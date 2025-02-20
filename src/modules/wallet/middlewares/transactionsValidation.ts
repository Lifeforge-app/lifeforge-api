import { body, param, query } from "express-validator";
import moment from "moment";

export const validateYearAndMonth = [
  query("year").isNumeric(),
  query("month").isNumeric(),
];

export const validateBodyDataForCreation = [
  body("particulars").isString(),
  body("date").custom((value: string) => {
    if (!value) {
      throw new Error("Invalid value");
    }

    if (!moment(value).isValid()) {
      throw new Error("Invalid value");
    }

    return true;
  }),
  body("amount").isNumeric(),
  body("location").optional().isString(),
  body("category").isString().optional(),
  body("asset").custom((value: string, { req }) => {
    if (req.body.type === "transfer") {
      return !!!value;
    }

    return ["income", "expenses"].includes(req.body.type)
      ? typeof value === "string" && value.length > 0
      : true;
  }),
  body("ledger").isString().optional(),
  body("type").isIn(["income", "expenses", "transfer"]),
  body("fromAsset").custom((value: string, { req }) => {
    if (req.body.type !== "transfer") {
      return !!!value;
    }

    return typeof value === "string" && value.length > 0;
  }),
  body("toAsset").custom((value: string, { req }) => {
    if (req.body.type !== "transfer") {
      return !!!value;
    }

    return typeof value === "string" && value.length > 0;
  }),
];

export const validateBodyDataForUpdate = [
  body("particulars").isString(),
  body("date").custom((value: string) => {
    if (!value) {
      throw new Error("Invalid value");
    }

    if (!moment(value).isValid()) {
      throw new Error("Invalid value");
    }

    return true;
  }),
  body("amount").isNumeric(),
  body("location").optional().isString(),
  body("category").isString().optional(),
  body("asset").isString().optional(),
  body("ledger").isString().optional(),
  body("type").isIn(["income", "expenses"]),
];

export const validateId = param("id").isString();
