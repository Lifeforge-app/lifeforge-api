import express from "express";

import * as listsController from "../controllers/lists.controller";

const router = express.Router();

router.get("/:id", listsController.getList);

router.get("/valid/:id", listsController.checkListExists);

router.get("/", listsController.getAllLists);

router.post("/", listsController.createList);

router.patch("/:id", listsController.updateList);

router.delete("/:id", listsController.deleteList);

export default router;
