import { decrypt2 } from "@utils/encryption";
import { checkExistence } from "@utils/PBRecordValidator";
import { serverError, successWithBaseResponse } from "@utils/response";
import { Request, Response } from "express";
import { challenge } from "..";
import { BaseResponse } from "../../../core/typescript/base_response";
import * as entriesService from "../services/entries.service";
import { IAPIKeyEntry } from "../typescript/api_keys_interfaces";
import getDecryptedMaster from "../utils/getDecryptedMaster";

export const getAllEntries = async (
  req: Request,
  res: Response<BaseResponse<IAPIKeyEntry[]>>,
) => {
  const { pb } = req;
  const master = decodeURIComponent(req.query.master as string);

  try {
    const decryptedMaster = await getDecryptedMaster(master, pb, res);
    if (!decryptedMaster) return;

    const entries = await entriesService.getAllEntries(pb);
    successWithBaseResponse(res, entries);
  } catch (error) {
    console.error(error);
    serverError(res, "Failed to fetch API key entries");
  }
};

export const checkKeys = async (req: Request, res: Response) => {
  const { pb } = req;
  const { keys } = req.query as { keys: string };

  try {
    const result = await entriesService.checkKeys(pb, keys);
    successWithBaseResponse(res, result);
  } catch (error) {
    console.error(error);
    serverError(res, "Failed to check API keys");
  }
};

export const getEntryById = async (
  req: Request,
  res: Response<BaseResponse<string>>,
) => {
  const { pb } = req;
  const { id } = req.params;
  const master = decodeURIComponent(req.query.master as string);

  if (!(await checkExistence(req, res, "api_keys", id))) {
    return;
  }

  try {
    const decryptedMaster = await getDecryptedMaster(master, pb, res);
    if (!decryptedMaster) return;

    const encryptedKey = await entriesService.getEntryById(
      pb,
      id,
      decryptedMaster,
    );
    successWithBaseResponse(res, encryptedKey);
  } catch (error) {
    console.error(error);
    serverError(res, "Failed to fetch API key entry");
  }
};

export const createEntry = async (
  req: Request,
  res: Response<BaseResponse<IAPIKeyEntry>>,
) => {
  const { pb } = req;
  const { data } = req.body;

  try {
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
  } catch (error) {
    console.error(error);
    serverError(res, "Failed to create API key entry");
  }
};

export const updateEntry = async (
  req: Request,
  res: Response<BaseResponse<IAPIKeyEntry>>,
) => {
  const { pb } = req;
  const { id } = req.params;
  const { data } = req.body;

  if (!(await checkExistence(req, res, "api_keys", id))) {
    return;
  }

  try {
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
  } catch (error) {
    console.error(error);
    serverError(res, "Failed to update API key entry");
  }
};

export const deleteEntry = async (
  req: Request,
  res: Response<BaseResponse<undefined>>,
) => {
  const { pb } = req;
  const { id } = req.params;

  if (!(await checkExistence(req, res, "api_keys", id))) {
    return;
  }

  try {
    await entriesService.deleteEntry(pb, id);
    successWithBaseResponse(res, undefined, 204);
  } catch (error) {
    console.error(error);
    serverError(res, "Failed to delete API key entry");
  }
};
