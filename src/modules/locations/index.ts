import express from "express";
import { query } from "express-validator";
import asyncWrapper from "../../utils/asyncWrapper";
import { getAPIKey } from "../../utils/getAPIKey";
import {
  clientError,
  serverError,
  successWithBaseResponse,
} from "../../utils/response";

const router = express.Router();

router.get(
  "/",
  [query("q").isString()],
  asyncWrapper(async (req, res) => {
    const { q } = req.query;
    const key = await getAPIKey("gcloud", req.pb);

    if (!key) {
      clientError(res, "API key not found");
      return;
    }

    try {
      fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(q as string)}&key=${key}`,
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
  }),
);

router.get("/enabled", async (req, res) => {
  const key = await getAPIKey("gcloud", req.pb);

  successWithBaseResponse(res, !!key);
});

export default router;
