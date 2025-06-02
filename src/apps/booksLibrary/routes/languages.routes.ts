import express from "express";

import asyncWrapper from "@utils/asyncWrapper";

import * as LanguagesController from "../controllers/languages.controller";
import {
  validateBodyData,
  validateId,
} from "../middlewares/languagesValidation";

const router = express.Router();

router.get("/", asyncWrapper(LanguagesController.getAllLanguages));

router.post(
  "/",
  validateBodyData,
  asyncWrapper(LanguagesController.createLanguage),
);

router.patch(
  "/:id",
  validateId,
  validateBodyData,
  asyncWrapper(LanguagesController.updateLanguage),
);

router.delete(
  "/:id",
  validateId,
  asyncWrapper(LanguagesController.deleteLanguage),
);

export default router;
