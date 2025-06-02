import express from "express";

import * as LanguagesController from "../controllers/languages.controller";

const router = express.Router();

router.get("/", LanguagesController.getAllLanguages);

router.post("/", LanguagesController.createLanguage);

router.patch("/:id", LanguagesController.updateLanguage);

router.delete("/:id", LanguagesController.deleteLanguage);

export default router;
