import express from "express";
import { list } from "../../../utils/CRUD";
import {
  IMailInboxEntry,
  IMailInboxLabel,
} from "../../../interfaces/mail_inbox_interfaces";

const router = express.Router();

router.get("/", (req, res) =>
  list<IMailInboxLabel>(req, res, "mail_inbox_labels")
);

export default router;
