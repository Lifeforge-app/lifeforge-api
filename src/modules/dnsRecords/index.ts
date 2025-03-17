import asyncWrapper from "@utils/asyncWrapper";
import { getAPIKey } from "@utils/getAPIKey";
import { serverError, successWithBaseResponse } from "@utils/response";
import express from "express";
import { body, query } from "express-validator";

const router = express.Router();

router.get(
  "/list",
  asyncWrapper(async (req, res) => {
    const key = await getAPIKey("cpanel", req.pb);

    if (!key) {
      serverError(res, "API key not found");
      return;
    }

    const url =
      "https://cpanel.thecodeblog.net/execute/DNS/parse_zone?zone=thecodeblog.net";
    const headers = {
      Authorization: `cpanel thecodeb:${key}`,
    };

    const response = await fetch(url, { headers });
    const raw = await response.json();
    const { data } = raw;

    data.forEach((record: any) => {
      if (Object.keys(record).includes("dname_b64")) {
        record.dname_b64 = atob(record.dname_b64);
      }

      if (Object.keys(record).includes("data_b64")) {
        record.data_b64 = record.data_b64.map((item: string) => atob(item));
      }

      if (Object.keys(record).includes("text_b64")) {
        record.text_b64 = atob(record.text_b64);
      }
    });

    successWithBaseResponse(res, data);
  }),
);

router.delete(
  "/",
  [body("target").isArray(), query("serial").isNumeric()],
  asyncWrapper(async (req, res) => {
    const key = await getAPIKey("cpanel", req.pb);

    const { target } = req.body;
    const { serial } = req.query;

    const url = `https://cpanel.thecodeblog.net/execute/DNS/mass_edit_zone?zone=thecodeblog.net&serial=${serial}&${target.map((item: string) => `remove=${item}`).join("&")}`;
    const headers = {
      Authorization: `cpanel thecodeb:${key}`,
    };

    const response = await fetch(url, { headers });
    const raw = await response.json();

    if (response.ok && raw.data && !raw.errors) {
      successWithBaseResponse(res, raw.data.newSerial);
      return;
    }

    serverError(res, raw.errors[0]);
  }),
);

export default router;
