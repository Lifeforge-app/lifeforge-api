import { decrypt2 } from "@utils/encryption";
import bcrypt from "bcrypt";
import PocketBase from "pocketbase";

export const createOrUpdateMasterPassword = async (
  pb: PocketBase,
  password: string,
): Promise<void> => {
  const salt = await bcrypt.genSalt(10);
  const APIKeysMasterPasswordHash = await bcrypt.hash(password, salt);

  const id = pb.authStore.record?.id;

  if (!id) {
    throw new Error("No user found");
  }

  await pb.collection("users").update(id, {
    APIKeysMasterPasswordHash,
  });
};

export const verifyMasterPassword = async (
  pb: PocketBase,
  password: string,
  challenge: string,
): Promise<boolean> => {
  const id = pb.authStore.record?.id;

  if (!id) {
    return false;
  }

  const decryptedMaster = decrypt2(password, challenge);

  const user = await pb.collection("users").getOne(id);
  const { APIKeysMasterPasswordHash } = user;

  return await bcrypt.compare(decryptedMaster, APIKeysMasterPasswordHash);
};
