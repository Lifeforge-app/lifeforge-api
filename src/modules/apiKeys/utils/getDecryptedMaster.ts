import { decrypt2 } from "@utils/encryption";
import { clientError } from "@utils/response";
import bcrypt from "bcrypt";
import { Response } from "express";
import Pocketbase from "pocketbase";
import { challenge } from "..";

export default async function getDecryptedMaster(
  master: string,
  pb: Pocketbase,
  res: Response,
): Promise<string | null> {
  if (!pb.authStore.record) {
    clientError(res, "Auth store not initialized");
    return null;
  }

  const { APIKeysMasterPasswordHash } = pb.authStore.record;
  const decryptedMaster = decrypt2(master, challenge);
  const isMatch = await bcrypt.compare(
    decryptedMaster,
    APIKeysMasterPasswordHash,
  );

  if (!isMatch) {
    clientError(res, "Invalid master password");
    return null;
  }

  return decryptedMaster;
}
