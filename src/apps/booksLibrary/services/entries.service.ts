import mailer from "nodemailer";
import Pocketbase from "pocketbase";
import {
  IBooksLibraryEntry,
  IBooksLibraryFileType,
} from "../typescript/books_library_interfaces";

export const getAllEntries = async (
  pb: Pocketbase,
): Promise<IBooksLibraryEntry[]> => {
  return await pb
    .collection("books_library_entries")
    .getFullList<IBooksLibraryEntry>({
      sort: "-is_favourite,-created",
    });
};

export const updateEntry = async (
  pb: Pocketbase,
  id: string,
  data: Partial<IBooksLibraryEntry>,
): Promise<IBooksLibraryEntry> => {
  return await pb
    .collection("books_library_entries")
    .update<IBooksLibraryEntry>(id, data);
};

export const toggleFavouriteStatus = async (
  pb: Pocketbase,
  id: string,
): Promise<IBooksLibraryEntry> => {
  const book = await pb
    .collection("books_library_entries")
    .getOne<IBooksLibraryEntry>(id);

  if (!book) {
    throw new Error("Entry not found");
  }

  return await pb
    .collection("books_library_entries")
    .update<IBooksLibraryEntry>(id, {
      is_favourite: !book.is_favourite,
    });
};

export const sendToKindle = async (
  pb: Pocketbase,
  id: string,
  credentials: { user: string; pass: string },
  targetEmail: string,
): Promise<void> => {
  console.log(credentials);
  const transporter = mailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: credentials,
  });

  try {
    await transporter.verify();
  } catch (err) {
    throw new Error("SMTP credentials are invalid");
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

export const deleteEntry = async (
  pb: Pocketbase,
  id: string,
): Promise<void> => {
  const entry = await pb
    .collection("books_library_entries")
    .getOne<IBooksLibraryEntry>(id);

  if (!entry) {
    throw new Error("Entry not found");
  }

  const fileTypeEntry = await pb
    .collection("books_library_file_types_with_amount")
    .getFirstListItem<IBooksLibraryFileType>(`name = "${entry.extension}"`);

  if (!fileTypeEntry) {
    throw new Error("File type not found");
  }

  if (fileTypeEntry.amount === 1) {
    await pb.collection("books_library_file_types").delete(fileTypeEntry.id);
  }

  await pb.collection("books_library_entries").delete(id);
};
