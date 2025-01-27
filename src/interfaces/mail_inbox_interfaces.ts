import * as s from "superstruct";
import { BasePBCollectionSchema } from "./pocketbase_interfaces.js";

const IMailInboxAddressSchema = s.assign(
  BasePBCollectionSchema,
  s.object({
    name: s.string(),
    address: s.string(),
  })
);

const IMailInboxAttachmentSchema = s.assign(
  BasePBCollectionSchema,
  s.object({
    name: s.string(),
    size: s.number(),
    file: s.string(),
  })
);

const IMailInboxEntrySchema = s.assign(
  BasePBCollectionSchema,
  s.object({
    uid: s.string(),
    subject: s.string(),
    date: s.string(),
    text: s.string(),
    html: s.optional(s.string()),
    seen: s.boolean(),
    from: s.union([
      s.object({
        name: s.string(),
        address: s.string(),
      }),
      s.string(),
    ]),
    to: s.union([
      s.array(
        s.object({
          name: s.string(),
          address: s.string(),
        })
      ),
      s.string(),
    ]),
    cc: s.union([
      s.array(
        s.object({
          name: s.string(),
          address: s.string(),
        })
      ),
      s.string(),
    ]),
    attachments: s.union([
      s.array(
        s.object({
          name: s.string(),
          size: s.number(),
          file: s.string(),
        })
      ),
      s.string(),
    ]),
    unsubscribeUrl: s.string(),
    expand: s.optional(
      s.object({
        mail_inbox_attachments_via_belongs_to: s.optional(
          s.array(IMailInboxAttachmentSchema)
        ),
        from: IMailInboxAddressSchema,
        to: s.optional(s.array(IMailInboxAddressSchema)),
        cc: s.optional(s.array(IMailInboxAddressSchema)),
      })
    ),
  })
);

type IMailInboxAddress = s.Infer<typeof IMailInboxAddressSchema>;
type IMailInboxAttachment = s.Infer<typeof IMailInboxAttachmentSchema>;
type IMailInboxEntry = s.Infer<typeof IMailInboxEntrySchema>;

export {
  IMailInboxEntrySchema,
  IMailInboxAddressSchema,
  IMailInboxAttachmentSchema,
};

export type { IMailInboxEntry, IMailInboxAttachment, IMailInboxAddress };
