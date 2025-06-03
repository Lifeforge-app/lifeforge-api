import express from "express";

import * as tagsController from "../controllers/tags.controller";

const router = express.Router();

router.get("/:container", tagsController.getTags);

router.post("/:container", tagsController.createTag);

router.patch("/:id", tagsController.updateTag);

router.delete("/:id", tagsController.deleteTag);

export default router;
