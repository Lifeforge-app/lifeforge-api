import express from "express";
import event from "./events.js";
import category from "./categories.js";

const router = express.Router();

router.use("/events", event);
router.use("/categories", category);

export default router;
