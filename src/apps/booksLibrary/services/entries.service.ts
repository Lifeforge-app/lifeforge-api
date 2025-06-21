import ClientError from "@functions/ClientError";
import mailer from "nodemailer";
import Pocketbase from "pocketbase";

import { WithPB } from "@typescript/pocketbase_interfaces";

import { IBooksLibraryEntry } from "../typescript/books_library_interfaces";

export const getAllEntries = (
  pb: Pocketbase,
): Promise<WithPB<IBooksLibraryEntry>[]> =>
  pb
    .collection("books_library_entries")
    .getFullList<WithPB<IBooksLibraryEntry>>({
      sort: "-is_favourite,-created",
    });

export const updateEntry = (
  pb: Pocketbase,
  id: string,
  data: Pick<
    IBooksLibraryEntry,
    | "title"
    | "authors"
    | "category"
    | "edition"
    | "languages"
    | "isbn"
    | "publisher"
    | "year_published"
  >,
): Promise<WithPB<IBooksLibraryEntry>> =>
  pb
    .collection("books_library_entries")
    .update<WithPB<IBooksLibraryEntry>>(id, data);

export const toggleFavouriteStatus = async (
  pb: Pocketbase,
  id: string,
): Promise<WithPB<IBooksLibraryEntry>> => {
  const book = await pb
    .collection("books_library_entries")
    .getOne<WithPB<IBooksLibraryEntry>>(id);

  return await pb
    .collection("books_library_entries")
    .update<WithPB<IBooksLibraryEntry>>(id, {
      is_favourite: !book.is_favourite,
    });
};

export const sendToKindle = async (
  pb: Pocketbase,
  id: string,
  credentials: { user: string; pass: string },
  targetEmail: string,
): Promise<void> => {
  const transporter = mailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: credentials,
  });

  try {
    await transporter.verify();
  } catch (err) {
    throw new ClientError("SMTP credentials are invalid");
  }

  const entry = await pb
    .collection("books_library_entries")
    .getOne<IBooksLibraryEntry>(id);

  const fileLink = pb.files.getURL(entry, entry.file);
  const content = await fetch(fileLink).then((res) => res.arrayBuffer());
  const fileName = `${entry.title}.${entry.extension}`;

  const mail = {
    from: `"Lifeforge Books Library" <${credentials.user}>`,
    to: targetEmail,
    subject: "",
    text: `Here is your book: ${entry.title}`,
    attachments: [
      {
        filename: fileName,
        content: Buffer.from(content),
      },
    ],
    headers: {
      "X-SES-CONFIGURATION-SET": "Kindle",
    },
  };

  try {
    await transporter.sendMail(mail);
  } catch (err) {
    throw new Error("Failed to send email to Kindle: " + err);
  }
};

export const deleteEntry = async (pb: Pocketbase, id: string) => {
  await pb.collection("books_library_entries").delete(id);
};
