import express, { Request, Response } from "express";
import auth from "./routes/auth";
import { v4 } from "uuid";
import { body, param, query } from "express-validator";
import { decrypt2, decrypt, encrypt, encrypt2 } from "../../utils/encryption";
import bcrypt from "bcrypt";
import { clientError, successWithBaseResponse } from "../../utils/response";
import Pocketbase from "pocketbase";
import asyncWrapper from "../../utils/asyncWrapper";
import hasError from "../../utils/checkError";
import { BaseResponse } from "../../interfaces/base_response";
import { IAPIKeyEntry } from "../../interfaces/api_keys_interfaces";

const router = express.Router();

export let challenge = v4();

setTimeout(() => {
  challenge = v4();
}, 1000 * 60);

router.use("/auth", auth);

async function getDecryptedMaster(
  master: string,
  pb: Pocketbase,
  res: Response
): Promise<string | null> {
  if (!pb.authStore.record) {
    clientError(res, "Auth store not initialized");
    return null;
  }

  const { APIKeysMasterPasswordHash } = pb.authStore.record;
  const decryptedMaster = decrypt2(master, challenge);
  const isMatch = await bcrypt.compare(
    decryptedMaster,
    APIKeysMasterPasswordHash
  );

  if (!isMatch) {
    clientError(res, "Invalid master password");
    return null;
  }

  return decryptedMaster;
}

router.get(
  "/",
  [query("master").isString()],
  asyncWrapper(async (req, res: Response<BaseResponse<IAPIKeyEntry[]>>) => {
    const { pb } = req;
    const master = decodeURIComponent(req.query.master as string);

    const decryptedMaster = await getDecryptedMaster(master, pb, res);

    if (!decryptedMaster) return;

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

    successWithBaseResponse(res, entries);
  })
);

router.get(
  "/check",
  [query("keys").isString()],
  asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { keys } = req.query as { keys: string };

    const allEntries = await pb.collection("api_keys_entries").getFullList();

    successWithBaseResponse(
      res,
      keys
        .split(",")
        .every((key) => allEntries.some((entry) => entry.keyId === key))
    );
  })
);

router.get(
  "/:id",
  [query("master").isString()],
  asyncWrapper(async (req, res: Response<BaseResponse<string>>) => {
    const { pb } = req;
    const { id } = req.params;
    const master = decodeURIComponent(req.query.master as string);

    const decryptedMaster = await getDecryptedMaster(master, pb, res);

    if (!decryptedMaster) return;

    const entry = await pb.collection("api_keys_entries").getOne(id);

    if (!entry) {
      clientError(res, "Entry not found");
      return;
    }

    const decryptedKey = decrypt2(entry.key, process.env.MASTER_KEY!);
    const encryptedKey = encrypt2(decryptedKey, decryptedMaster);
    const encryptedSecondTime = encrypt2(encryptedKey, challenge);

    successWithBaseResponse(res, encryptedSecondTime);
  })
);

router.post(
  "/",
  [body("data").isString()],
  asyncWrapper(async (req, res: Response<BaseResponse<IAPIKeyEntry>>) => {
    const { pb } = req;
    const { data } = req.body;

    let decryptedData = null;

    try {
      decryptedData = JSON.parse(decrypt2(data, challenge));
    } catch (e) {
      clientError(res, "Invalid data");
      return;
    }

    const { id, name, description, icon, key, master } = decryptedData;

    const decryptedMaster = await getDecryptedMaster(master, pb, res);

    if (!decryptedMaster) return;

    const decryptedKey = decrypt2(key, decryptedMaster);
    const encryptedKey = encrypt2(decryptedKey, process.env.MASTER_KEY!);

    const entry = await pb.collection("api_keys_entries").create<IAPIKeyEntry>({
      keyId: id,
      name,
      description,
      icon,
      key: encryptedKey,
    });

    entry.key = decryptedKey.slice(-4);

    successWithBaseResponse(res, entry);
  })
);

router.patch(
  "/:id",
  [body("data").isString()],
  asyncWrapper(async (req, res: Response<BaseResponse<IAPIKeyEntry>>) => {
    const { pb } = req;
    const { id } = req.params;
    const { data } = req.body;

    let decryptedData = null;

    try {
      decryptedData = JSON.parse(decrypt2(data, challenge));
    } catch (e) {
      clientError(res, "Invalid data");
      return;
    }

    const { name, description, icon, key, master } = decryptedData;

    const decryptedMaster = await getDecryptedMaster(master, pb, res);

    if (!decryptedMaster) return;

    const decryptedKey = decrypt2(key, decryptedMaster);
    const encryptedKey = encrypt2(decryptedKey, process.env.MASTER_KEY!);

    const updatedEntry = await pb
      .collection("api_keys_entries")
      .update<IAPIKeyEntry>(id, {
        name,
        description,
        icon,
        key: encryptedKey,
      });

    updatedEntry.key = decryptedKey.slice(-4);

    successWithBaseResponse(res, updatedEntry);
  })
);

router.delete(
  "/:id",
  [param("id").isString()],
  asyncWrapper(async (req, res) => {
    const { pb } = req;
    const { id } = req.params;

    await pb.collection("api_keys_entries").delete(id);
    successWithBaseResponse(res);
  })
);

export default router;
