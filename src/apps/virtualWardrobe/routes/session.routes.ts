import express from "express";

import * as SessionController from "../controllers/session.controller";

const router = express.Router();

router.get("/", SessionController.getCart);

router.post("/checkout", SessionController.checkout);

router.post("/:id", SessionController.addToCart);

router.delete("/:id", SessionController.removeFromCart);

export default router;
