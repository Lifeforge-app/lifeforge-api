import express from "express";
import transactionsRoutes from "./routes/transactions.js";
import categoryRoutes from "./routes/category.js";
import assetsRoutes from "./routes/assets.js";
import ledgersRoutes from "./routes/ledgers.js";
import { query } from "express-validator";
import hasError from "../../utils/checkError.js";
import asyncWrapper from "../../utils/asyncWrapper.js";
import { serverError, successWithBaseResponse } from "../../utils/response.js";

const router = express.Router();

router.use("/transactions", transactionsRoutes);
router.use("/categories", categoryRoutes);
router.use("/assets", assetsRoutes);
router.use("/ledgers", ledgersRoutes);

router.get(
  "/locations",
  [query("q").isString(), query("key").isString()],
  asyncWrapper(async (req, res) => {
    if (hasError(req, res)) return;

    // https://maps.googleapis.com/maps/api/place/autocomplete/json?input=taman+molek&key=AIzaSyACIfnP46cNm8nP9HaMafF0hwI9X0hyyg4
    const { q, key } = req.query;

    try {
      fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(q)}&key=${key}`
      )
        .then((response) => response.json())
        .then((data) => {
          successWithBaseResponse(res, data);
        })
        .catch((error) => {
          serverError(res);
        });
    } catch (error) {
      serverError(res);
    }
  })
);

export default router;
