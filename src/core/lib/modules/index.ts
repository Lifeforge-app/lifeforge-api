import express from "express";
import _ from "lodash";

import { singleUploadMiddleware } from "../../middlewares/uploadMiddleware";
import * as ModulesController from "./controllers/modules.controller";

const router = express.Router();

router.get("/paths", ModulesController.listAppPaths);

router.post("/toggle/:id", ModulesController.toggleModule);

router.post("/package/:id", ModulesController.packageModule);

router.post(
  "/install",
  singleUploadMiddleware,
  ModulesController.installModule,
);

export default router;
