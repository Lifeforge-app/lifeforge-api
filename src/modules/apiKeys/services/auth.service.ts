import { decrypt2 } from "@utils/encryption";
import bcrypt from "bcrypt";
import PocketBase from "pocketbase";

/**
 * Create or update master password
 */
export const createOrUpdateMasterPassword = async (
  pb: PocketBase,
  id: string,
  password: string,
): Promise<void> => {
  try {
    const salt = await bcrypt.genSalt(10);
    const APIKeysMasterPasswordHash = await bcrypt.hash(password, salt);

    await pb.collection("users").update(id, {
      APIKeysMasterPasswordHash,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Verify master password
 */
export const verifyMasterPassword = async (
  pb: PocketBase,
  password: string,
  challenge: string,
): Promise<boolean> => {
  try {
    const id = pb.authStore.record?.id;

    if (!id) {
      return false;
    }

    const decryptedMaster = decrypt2(password, challenge);

    const user = await pb.collection("users").getOne(id);
    const { APIKeysMasterPasswordHash } = user;

    return await bcrypt.compare(decryptedMaster, APIKeysMasterPasswordHash);
  } catch (error) {
    throw error;
  }
};
