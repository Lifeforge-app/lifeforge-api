import { v4 } from "uuid";
import { z } from "zod/v4";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import { zodHandler } from "@utils/asyncWrapper";
import { decrypt2 } from "@utils/encryption";

import { challenge } from "../services/auth.service";
import getDecryptedMaster, * as entriesService from "../services/entries.service";
import { APIKeyEntrySchema } from "../typescript/api_keys_interfaces";

export const getAllEntries = zodHandler(
  {
    query: z.object({
      master: z.string(),
    }),
    response: z.array(WithPBSchema(APIKeyEntrySchema)),
  },
  async ({ pb, query: { master } }) => {
    await getDecryptedMaster(pb, decodeURIComponent(master));
    return await entriesService.getAllEntries(pb);
  },
);

export const checkKeys = zodHandler(
  {
    query: z.object({
      keys: z.string(),
    }),
    response: z.boolean(),
  },
  async ({ pb, query: { keys } }) => await entriesService.checkKeys(pb, keys),
);

export const getEntryById = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    query: z.object({
      master: z.string(),
    }),
    response: z.string(),
  },
  async ({ pb, params: { id }, query: { master } }) => {
    const decryptedMaster = await getDecryptedMaster(
      pb,
      decodeURIComponent(master),
    );
    return await entriesService.getEntryById(pb, id, decryptedMaster);
  },
  {
    existenceCheck: {
      params: {
        id: "api_keys_entries",
      },
    },
  },
);

export const createEntry = zodHandler(
  {
    body: z.object({
      data: z.string(),
    }),
    response: WithPBSchema(APIKeyEntrySchema),
  },
  async ({ pb, body: { data } }) => {
    const decryptedData = JSON.parse(decrypt2(data, challenge));
    const { keyId, name, description, icon, key, master } = decryptedData;

    const decryptedMaster = await getDecryptedMaster(pb, master);

    return await entriesService.createEntry(pb, {
      keyId,
      name,
      description,
      icon,
      key,
      decryptedMaster,
    });
  },
  {
    statusCode: 201,
  },
);

export const updateEntry = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    body: z.object({
      data: z.string(),
    }),
    response: WithPBSchema(APIKeyEntrySchema),
  },
  async ({ pb, params: { id }, body: { data } }) => {
    const decryptedData = JSON.parse(decrypt2(data, challenge));
    const { keyId, name, description, icon, key, master } = decryptedData;

    const decryptedMaster = await getDecryptedMaster(pb, master);

    return await entriesService.updateEntry(pb, id, {
      keyId,
      name,
      description,
      icon,
      key,
      decryptedMaster,
    });
  },
  {
    existenceCheck: {
      params: {
        id: "api_keys_entries",
      },
    },
  },
);

export const deleteEntry = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  },
  async ({ pb, params: { id } }) => await entriesService.deleteEntry(pb, id),
  {
    existenceCheck: {
      params: {
        id: "api_keys_entries",
      },
    },
    statusCode: 204,
  },
);
