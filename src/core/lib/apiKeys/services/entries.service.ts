import { decrypt2, encrypt2 } from "@utils/encryption";
import PocketBase from "pocketbase";
import { challenge } from "..";
import { IAPIKeyEntry } from "../typescript/api_keys_interfaces";

export const getAllEntries = async (
  pb: PocketBase,
): Promise<IAPIKeyEntry[]> => {
  const entries = await pb
    .collection("api_keys_entries")
    .getFullList<IAPIKeyEntry>({
      sort: "name",
    });

  entries.forEach((entry) => {
    entry.key = decrypt2(entry.key, process.env.MASTER_KEY!)
      .toString()
      .slice(-4);
  });

  return entries;
};

export const checkKeys = async (
  pb: PocketBase,
  keys: string,
): Promise<boolean> => {
  const allEntries = await pb.collection("api_keys_entries").getFullList();

  return keys
    .split(",")
    .every((key) => allEntries.some((entry) => entry.keyId === key));
};

export const getEntryById = async (
  pb: PocketBase,
  id: string,
  decryptedMaster: string,
): Promise<string> => {
  const entry = await pb.collection("api_keys_entries").getOne(id);

  if (!entry) {
    throw new Error("Entry not found");
  }

  const decryptedKey = decrypt2(entry.key, process.env.MASTER_KEY!);
  const encryptedKey = encrypt2(decryptedKey, decryptedMaster);
  const encryptedSecondTime = encrypt2(encryptedKey, challenge);

  return encryptedSecondTime;
};

interface EntryCreateData {
  keyId: string;
  name: string;
  description: string;
  icon: string;
  key: string;
  decryptedMaster: string;
}

export const createEntry = async (
  pb: PocketBase,
  data: EntryCreateData,
): Promise<IAPIKeyEntry> => {
  const { keyId, name, description, icon, key, decryptedMaster } = data;

  const decryptedKey = decrypt2(key, decryptedMaster);
  const encryptedKey = encrypt2(decryptedKey, process.env.MASTER_KEY!);

  const entry = await pb.collection("api_keys_entries").create<IAPIKeyEntry>({
    keyId,
    name,
    description,
    icon,
    key: encryptedKey,
  });

  entry.key = decryptedKey.slice(-4);

  return entry;
};

export const updateEntry = async (
  pb: PocketBase,
  id: string,
  data: EntryCreateData,
): Promise<IAPIKeyEntry> => {
  const { keyId, name, description, icon, key, decryptedMaster } = data;

  const decryptedKey = decrypt2(key, decryptedMaster);
  const encryptedKey = encrypt2(decryptedKey, process.env.MASTER_KEY!);

  const updatedEntry = await pb
    .collection("api_keys_entries")
    .update<IAPIKeyEntry>(id, {
      keyId,
      name,
      description,
      icon,
      key: encryptedKey,
    });

  updatedEntry.key = decryptedKey.slice(-4);

  return updatedEntry;
};

export const deleteEntry = async (
  pb: PocketBase,
  id: string,
): Promise<void> => {
  await pb.collection("api_keys_entries").delete(id);
};
