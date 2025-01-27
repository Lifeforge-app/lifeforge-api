import _ from "underscore";
import express, { Response } from "express";
import { serverError, successWithBaseResponse } from "../../utils/response.js";
import asyncWrapper from "../../utils/asyncWrapper.js";
import { param, query } from "express-validator";
import hasError from "../../utils/checkError.js";
import getIMAPConfig from "../../services/mailInbox/utils/getIMAPConfig.js";
import imaps from "imap-simple";
import { checkExistence } from "../../utils/PBRecordValidator.js";
import { IMailInboxEntry } from "../../interfaces/mail_inbox_interfaces.js";
import Pocketbase from "pocketbase";
import { BaseResponse } from "../../interfaces/base_response.js";

const router = express.Router();

function cleanupRecord(
  record: IMailInboxEntry,
  pb: Pocketbase,
  removeHTML: boolean
) {
  if (!record.expand) {
    return;
  }

  record.from = {
    name: record.expand.from.name,
    address: record.expand.from.address,
  };

  if (record.expand.to) {
    record.to = record.expand.to.map((to) => ({
      name: to.name,
      address: to.address,
    }));
  }

  if (record.expand.cc) {
    record.cc = record.expand.cc.map((cc) => ({
      name: cc.name,
      address: cc.address,
    }));
  }

  if (record.expand.mail_inbox_attachments_via_belongs_to) {
    record.attachments =
      record.expand.mail_inbox_attachments_via_belongs_to.map((attachment) => ({
        name: attachment.name,
        size: attachment.size,
        file: pb.files.getURL(attachment, attachment.file).split("/files/")[1],
      }));
  }

  delete record.expand;
  if (removeHTML) {
    delete record.html;
  }
}

router.get(
  "/",
  [query("page").isInt().optional()],
  asyncWrapper(async (req, res) => {
    if (hasError(req, res)) return;

    const { pb } = req;
    const page = parseInt((req.query.page as string) || "1");

    const result = await pb
      .collection("mail_inbox_entries")
      .getList<IMailInboxEntry>(page, 25, {
        sort: "-uid",
        expand: "mail_inbox_attachments_via_belongs_to, from, to, cc",
      });

    result.items.forEach((result) => {
      cleanupRecord(result, pb, true);
    });

    successWithBaseResponse(res, result);
  })
);

router.get(
  "/:id",
  [param("id").isString().notEmpty()],
  asyncWrapper(async (req, res: Response<BaseResponse<IMailInboxEntry>>) => {
    if (hasError(req, res)) return;

    const { pb } = req;
    const config = await getIMAPConfig(pb);

    if (!config) {
      serverError(res, "Failed to get IMAP config");
      return;
    }

    if (
      !(await checkExistence(
        req,
        res,
        "mail_inbox_entries",
        req.params.id,
        "entry"
      ))
    ) {
      return;
    }

    let record = await pb
      .collection("mail_inbox_entries")
      .getOne<IMailInboxEntry>(req.params.id, {
        expand: "mail_inbox_attachments_via_belongs_to, from, to, cc",
      });

    cleanupRecord(record, pb, false);

    if (!record.seen) {
      const connection = await imaps.connect(config);
      await connection.openBox("INBOX");

      await connection.addFlags(parseInt(record.uid), "\\Seen");

      record = await pb.collection("mail_inbox_entries").update(record.id, {
        seen: true,
      });
    }

    successWithBaseResponse(res, record);
  })
);

export default router;
