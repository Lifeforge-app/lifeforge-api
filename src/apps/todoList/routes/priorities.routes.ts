import express from "express";

import * as prioritiesController from "../controllers/priorities.controller";

const router = express.Router();

router.get("/", prioritiesController.getAllPriorities);

router.post("/", prioritiesController.createPriority);

router.patch("/:id", prioritiesController.updatePriority);

router.delete("/:id", prioritiesController.deletePriority);

export default router;
