import express from "express";
import category from "./categories.js";
import event from "./events.js";

const router = express.Router();

router.use("/events", event);
router.use("/categories", category);

export default router;
