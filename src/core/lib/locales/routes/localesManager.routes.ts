import express from "express";

import * as LocalesManagerController from "../controllers/localesManager.controller";

const router = express.Router();

router.get("/:namespace", LocalesManagerController.listSubnamespaces);

router.get("/:namespace/:subnamespace", LocalesManagerController.listLocales);

router.post(
  "/sync/:namespace/:subnamespace",
  LocalesManagerController.syncLocales,
);

router.post(
  "/suggestions/:namespace/:subnamespace",
  LocalesManagerController.getTranslationSuggestions,
);

router.post(
  "/:type/:namespace/:subnamespace",
  LocalesManagerController.createLocale,
);

router.patch(
  "/:namespace/:subnamespace",
  LocalesManagerController.renameLocale,
);

router.delete(
  "/delete/:namespace/:subnamespace",
  LocalesManagerController.deleteLocale,
);

export default router;
