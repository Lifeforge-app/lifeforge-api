import express from "express";
import { body, param } from "express-validator";

import { checkExistence } from "@utils/PBRecordValidator";
import asyncWrapper from "@utils/asyncWrapper";
import { clientError, successWithBaseResponse } from "@utils/response";

import { IVirtualWardrobeEntry } from "../typescript/virtual_wardrobe_interfaces";

const sessionCart = new Set<IVirtualWardrobeEntry>();

const router = express.Router();

router.get("/", (req, res) => {
  successWithBaseResponse(res, Array.from(sessionCart));
});

router.post(
  "/checkout",
  [body("notes").isString()],
  asyncWrapper(async (req, res) => {
    const { pb } = req;
    const cart = Array.from(sessionCart);
    if (cart.length === 0) {
      clientError(res, "Cart is empty", 400);
      return;
    }

    const entryIds = cart.map((entry) => entry.id);

    await pb.collection("virtual_wardrobe_histories").create({
      entries: entryIds,
      notes: req.body.notes,
    });

    for (const entry of cart) {
      await pb.collection("virtual_wardrobe_entries").update(entry.id, {
        "times_worn+": 1,
        last_worn: new Date(),
      });
    }

    sessionCart.clear();
    successWithBaseResponse(res);
  }),
);

router.post(
  "/:id",
  [param("id").isString()],
  asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { id } = req.params;
    if (!(await checkExistence(req, res, "virtual_wardrobe_entries", id)))
      return;

    if (Array.from(sessionCart).some((item) => item.id === id)) {
      clientError(res, "Entry already in cart", 400);
      return;
    }

    const item = await pb
      .collection("virtual_wardrobe_entries")
      .getOne<IVirtualWardrobeEntry>(id);
    item.front_image = pb.files
      .getURL(item, item.front_image)
      .split("/files/")[1];
    item.back_image = pb.files
      .getURL(item, item.back_image)
      .split("/files/")[1];

    sessionCart.add(item);

    successWithBaseResponse(res);
  }),
);

router.delete(
  "/:id",
  [param("id").isString()],
  asyncWrapper(async (req, res) => {
    const { id } = req.params;
    if (!(await checkExistence(req, res, "virtual_wardrobe_entries", id)))
      return;

    const item = Array.from(sessionCart).find((item) => item.id === id);
    if (!item) {
      clientError(res, "Entry not in cart", 400);
      return;
    }

    sessionCart.delete(item);
    successWithBaseResponse(res);
  }),
);

export default router;
