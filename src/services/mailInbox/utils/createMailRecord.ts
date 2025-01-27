import imaps from "imap-simple";
import {
  AddressObject,
  Attachment,
  EmailAddress,
  Headers,
  simpleParser,
} from "mailparser";
import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";
import Pocketbase from "pocketbase";

async function createAddressRecordIfNotExists(
  addresses: EmailAddress[],
  pb: Pocketbase
) {
  for (const address of addresses) {
    const exist = await pb
      .collection("mail_inbox_addresses")
      .getFirstListItem(`address = "${address.address || ""}"`)
      .catch(() => null);

    if (!exist) {
      await pb
        .collection("mail_inbox_addresses")
        .create(address, {
          $autoCancel: false,
        })
        .catch(() => console.log("address"));

      console.log("created", address.address);
    }
  }
}

async function linkCCAndToRecords(
  addresses: {
    cc: EmailAddress[];
    to: EmailAddress[];
  },
  entryId: string,
  pb: Pocketbase
) {
  for (const type of ["cc", "to"]) {
    const ids = [];

    for (const address of addresses[type as "cc" | "to"]) {
      const record = await pb
        .collection("mail_inbox_addresses")
        .getFirstListItem(`address = "${address.address}"`)
        .catch(() => null);

      if (record) {
        ids.push(record.id);
      }
    }

    await pb.collection("mail_inbox_entries").update(entryId, {
      [type]: ids,
    });
  }
}

async function createAttachmentRecords(
  attachments: Attachment[],
  entryId: string,
  pb: Pocketbase
): Promise<void> {
  for (const attachment of attachments) {
    const filename = attachment.filename || "Untitled";
    const size = attachment.size;
    const contentType = attachment.contentType;
    const content = attachment.content;

    await pb.collection("mail_inbox_attachments").create({
      name: filename,
      size,
      file: new File([content], filename, { type: contentType }),
      belongs_to: entryId,
    });
  }
}

async function createUnsubscribeUrlRecord(
  headers: Headers,
  entryId: string,
  pb: Pocketbase
) {
  const mailList = headers.get("list") as Record<string, any> | undefined;

  if (!mailList) {
    return;
  }

  const unsubscribeUrl = mailList.unsubscribe?.url;

  if (unsubscribeUrl) {
    await pb.collection("mail_inbox_entries").update(entryId, {
      unsubscribeUrl,
    });
  }
}

export async function createMailRecord(message: imaps.Message, pb: Pocketbase) {
  const everything = message.parts.find((part) => part.which === "")?.body;
  const data = await simpleParser(everything);
  const id = message.attributes.uid;

  const existedData = await pb
    .collection("mail_inbox_entries")
    .getFirstListItem(`uid = ${id}`)
    .catch(() => null);

  if (existedData) {
    return;
  }

  if (data.html) {
    const window = new JSDOM("").window;
    const purify = DOMPurify(window);
    data.html = purify.sanitize(data.html, {
      FORBID_TAGS: ["style", "script", "link", "meta"],
    });

    const { document } = new JSDOM(data.html).window;
    data.text = document.body.textContent?.trim() || "No content";
  }

  const newData = await pb.collection("mail_inbox_entries").create({
    uid: id,
    subject: data.subject,
    date: data.date,
    text: data.text?.replace(/[\u200C\u034F\s]+/g, " "),
    html: data.html,
  });

  const from = data.from!.value[0];
  const to = (data.to as AddressObject)!.value;
  const cc = (data.cc as AddressObject)?.value || [];

  await createAddressRecordIfNotExists([from, ...to, ...cc], pb);

  const fromRecord = await pb
    .collection("mail_inbox_addresses")
    .getFirstListItem(`address = "${from.address}"`)
    .catch(() => null);

  await pb.collection("mail_inbox_entries").update(newData.id, {
    from: fromRecord!.id,
  });

  await linkCCAndToRecords({ cc, to }, newData.id, pb);

  await createAttachmentRecords(data.attachments, newData.id, pb);

  await createUnsubscribeUrlRecord(data.headers, newData.id, pb);
}
