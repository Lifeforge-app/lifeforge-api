import { decrypt, decrypt2, encrypt, encrypt2 } from "@functions/encryption";
import PocketBase from "pocketbase";

import { WithPB } from "@typescript/pocketbase_interfaces";

import { IPasswordEntry } from "../typescript/passwords_interfaces";
import { getDecryptedMaster } from "./master.service";

export const getAllEntries = async (
  pb: PocketBase,
): Promise<WithPB<IPasswordEntry>[]> =>
  await pb
    .collection("passwords__entries")
    .getFullList<WithPB<IPasswordEntry>>({
      sort: "-pinned, name",
    });

export const createEntry = async (
  pb: PocketBase,
  {
    name,
    icon,
    color,
    website,
    username,
    password,
    master,
  }: Omit<IPasswordEntry, "decrypted" | "pinned"> & { master: string },
  challenge: string,
): Promise<WithPB<IPasswordEntry>> => {
  const decryptedMaster = await getDecryptedMaster(pb, master, challenge);

  const decryptedPassword = decrypt2(password, challenge);
  const encryptedPassword = encrypt(
    Buffer.from(decryptedPassword),
    decryptedMaster,
  );

  const entry = await pb
    .collection("passwords__entries")
    .create<WithPB<IPasswordEntry>>({
      name,
      icon,
      color,
      website,
      username,
      password: encryptedPassword.toString("base64"),
    });

  return entry;
};

export const updateEntry = async (
  pb: PocketBase,
  id: string,
  {
    name,
    icon,
    color,
    website,
    username,
    password,
    master,
  }: Omit<IPasswordEntry, "decrypted" | "pinned"> & { master: string },
  challenge: string,
): Promise<WithPB<IPasswordEntry>> => {
  const decryptedMaster = await getDecryptedMaster(pb, master, challenge);

  const decryptedPassword = decrypt2(password, challenge);
  const encryptedPassword = encrypt(
    Buffer.from(decryptedPassword),
    decryptedMaster,
  );

  const entry = await pb
    .collection("passwords__entries")
    .update<WithPB<IPasswordEntry>>(id, {
      name,
      icon,
      color,
      website,
      username,
      password: encryptedPassword.toString("base64"),
    });

  return entry;
};

export const decryptEntry = async (
  pb: PocketBase,
  id: string,
  master: string,
  challenge: string,
): Promise<string> => {
  const decryptedMaster = await getDecryptedMaster(pb, master, challenge);

  const password: IPasswordEntry = await pb
    .collection("passwords__entries")
    .getOne(id);

  const decryptedPassword = decrypt(
    Buffer.from(password.password, "base64"),
    decryptedMaster,
  );

  return encrypt2(decryptedPassword.toString(), challenge);
};

export const deleteEntry = async (pb: PocketBase, id: string) => {
  await pb.collection("passwords__entries").delete(id);
};

export const togglePin = async (
  pb: PocketBase,
  id: string,
): Promise<WithPB<IPasswordEntry>> => {
  const entry = await pb
    .collection("passwords__entries")
    .getOne<WithPB<IPasswordEntry>>(id);

  return await pb
    .collection("passwords__entries")
    .update<WithPB<IPasswordEntry>>(id, {
      pinned: !entry.pinned,
    });
};
