import PocketBase from "pocketbase";
import { challenge } from "..";
import { IAPIKeyEntry } from "../../../interfaces/api_keys_interfaces";
import { decrypt2, encrypt2 } from "../../../utils/encryption";

export const getAllEntries = async (
  pb: PocketBase,
): Promise<IAPIKeyEntry[]> => {
  try {
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
  } catch (error) {
    throw new Error("Failed to fetch API key entries");
  }
};

export const checkKeys = async (
  pb: PocketBase,
  keys: string,
): Promise<boolean> => {
  try {
    const allEntries = await pb.collection("api_keys_entries").getFullList();

    return keys
      .split(",")
      .every((key) => allEntries.some((entry) => entry.keyId === key));
  } catch (error) {
    throw new Error("Failed to check keys");
  }
};

export const getEntryById = async (
  pb: PocketBase,
  id: string,
  decryptedMaster: string,
): Promise<string> => {
  try {
    const entry = await pb.collection("api_keys_entries").getOne(id);

    if (!entry) {
      throw new Error("Entry not found");
    }

    const decryptedKey = decrypt2(entry.key, process.env.MASTER_KEY!);
    const encryptedKey = encrypt2(decryptedKey, decryptedMaster);
    const encryptedSecondTime = encrypt2(encryptedKey, challenge);

    return encryptedSecondTime;
  } catch (error) {
    throw new Error("Failed to fetch API key entry");
  }
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
  try {
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
  } catch (error) {
    throw new Error("Failed to create API key entry");
  }
};

export const updateEntry = async (
  pb: PocketBase,
  id: string,
  data: EntryCreateData,
): Promise<IAPIKeyEntry> => {
  try {
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
  } catch (error) {
    throw new Error("Failed to update API key entry");
  }
};

export const deleteEntry = async (
  pb: PocketBase,
  id: string,
): Promise<void> => {
  try {
    await pb.collection("api_keys_entries").delete(id);
  } catch (error) {
    throw new Error("Failed to delete API key entry");
  }
};
