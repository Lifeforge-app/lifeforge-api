import express from "express";
import { IMailInboxLabel } from "../../../interfaces/mail_inbox_interfaces";
import { list } from "../../../utils/CRUD";

const router = express.Router();

router.get("/", (req, res) =>
  list<IMailInboxLabel>(req, res, "mail_inbox_labels"),
);

export default router;
