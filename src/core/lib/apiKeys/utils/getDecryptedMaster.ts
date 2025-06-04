import bcrypt from "bcrypt";
import { Response } from "express";
import Pocketbase from "pocketbase";

import ClientError from "@utils/ClientError";
import { decrypt2 } from "@utils/encryption";
import { clientError } from "@utils/response";

import { challenge } from "..";

export default async function getDecryptedMaster(
  pb: Pocketbase,
  master: string,
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
    throw new ClientError("Invalid master password", 401);
  }

  return decryptedMaster;
}
