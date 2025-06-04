import express from "express";

import * as LocaleController from "../controllers/locales.controller";

const router = express.Router();

router.get("/:lang/:namespace/:subnamespace", LocaleController.getLocales);

export default router;
