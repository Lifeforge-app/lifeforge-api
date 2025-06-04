import { Request, Response } from "express";

import { checkExistence } from "@utils/PBRecordValidator";
import { decrypt2 } from "@utils/encryption";
import { serverError, successWithBaseResponse } from "@utils/response";

import { challenge } from "..";
import { BaseResponse } from "../../../typescript/base_response";
import * as entriesService from "../services/entries.service";
import { IAPIKeyEntry } from "../typescript/api_keys_interfaces";

export const getAllEntries = async (
  req: Request,
  res: Response<BaseResponse<IAPIKeyEntry[]>>,
) => {
  const { pb } = req;
  const master = decodeURIComponent(req.query.master as string);

  const decryptedMaster = await getDecryptedMaster(master, pb, res);
  if (!decryptedMaster) return;

  const entries = await entriesService.getAllEntries(pb);
  successWithBaseResponse(res, entries);
};

export const checkKeys = async (req, res) => {
  const { pb } = req;
  const { keys } = req.query as { keys: string };

  const result = await entriesService.checkKeys(pb, keys);
  successWithBaseResponse(res, result);
};

export const getEntryById = async (
  req: Request,
  res: Response<BaseResponse<string>>,
) => {
  const { pb } = req;
  const { id } = req.params;
  const master = decodeURIComponent(req.query.master as string);

  if (!(await checkExistence(req, res, "api_keys_entries", id))) {
    return;
  }

  const decryptedMaster = await getDecryptedMaster(master, pb, res);
  if (!decryptedMaster) return;

  const encryptedKey = await entriesService.getEntryById(
    pb,
    id,
    decryptedMaster,
  );
  successWithBaseResponse(res, encryptedKey);
};

export const createEntry = async (
  req: Request,
  res: Response<BaseResponse<IAPIKeyEntry>>,
) => {
  const { pb } = req;
  const { data } = req.body;

  let decryptedData = null;

  try {
    decryptedData = JSON.parse(decrypt2(data, challenge));
  } catch (e) {
    serverError(res, "Invalid data format");
    return;
  }

  const { keyId, name, description, icon, key, master } = decryptedData;

  const decryptedMaster = await getDecryptedMaster(master, pb, res);
  if (!decryptedMaster) return;

  const entry = await entriesService.createEntry(pb, {
    keyId,
    name,
    description,
    icon,
    key,
    decryptedMaster,
  });

  successWithBaseResponse(res, entry, 201);
};

export const updateEntry = async (
  req: Request,
  res: Response<BaseResponse<IAPIKeyEntry>>,
) => {
  const { pb } = req;
  const { id } = req.params;
  const { data } = req.body;

  if (!(await checkExistence(req, res, "api_keys_entries", id))) {
    return;
  }

  let decryptedData = null;

  try {
    decryptedData = JSON.parse(decrypt2(data, challenge));
  } catch (e) {
    serverError(res, "Invalid data format");
    return;
  }

  const { keyId, name, description, icon, key, master } = decryptedData;

  const decryptedMaster = await getDecryptedMaster(master, pb, res);
  if (!decryptedMaster) return;

  const updatedEntry = await entriesService.updateEntry(pb, id, {
    keyId,
    name,
    description,
    icon,
    key,
    decryptedMaster,
  });

  successWithBaseResponse(res, updatedEntry);
};

export const deleteEntry = async (
  req: Request,
  res: Response<BaseResponse<undefined>>,
) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "api_keys_entries", id))) {
    return;
  }

  await entriesService.deleteEntry(pb, id);
  successWithBaseResponse(res, undefined, 204);
};
