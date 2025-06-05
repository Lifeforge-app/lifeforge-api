import { v4 } from "uuid";
import { z } from "zod/v4";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import { forgeController } from "@utils/forgeController";

import * as EntriesService from "../services/entries.service";
import { PasswordEntrySchema } from "../typescript/password_interfaces";

export let challenge = v4();

setTimeout(() => {
  challenge = v4();
}, 1000 * 60);

export const getChallenge = forgeController(
  {
    response: z.string(),
  },
  async () => challenge,
);

export const getAllEntries = forgeController(
  {
    response: z.array(WithPBSchema(PasswordEntrySchema)),
  },
  async ({ pb }) => await EntriesService.getAllEntries(pb),
);

export const createEntry = forgeController(
  {
    body: PasswordEntrySchema.omit({
      decrypted: true,
      pinned: true,
    }).extend({
      master: z.string(),
    }),
    response: WithPBSchema(PasswordEntrySchema),
  },
  async ({ pb, body }) => await EntriesService.createEntry(pb, body, challenge),
  {
    statusCode: 201,
  },
);

export const updateEntry = forgeController(
  {
    params: z.object({
      id: z.string(),
    }),
    body: PasswordEntrySchema.omit({
      decrypted: true,
      pinned: true,
    }).extend({
      master: z.string(),
    }),
    response: WithPBSchema(PasswordEntrySchema),
  },
  async ({ pb, params: { id }, body }) =>
    await EntriesService.updateEntry(pb, id, body, challenge),
  {
    existenceCheck: {
      params: {
        id: "passwords_entries",
      },
    },
  },
);

export const decryptEntry = forgeController(
  {
    params: z.object({
      id: z.string(),
    }),
    query: z.object({
      master: z.string(),
    }),
    response: z.string(),
  },
  async ({ pb, params: { id }, query: { master } }) =>
    await EntriesService.decryptEntry(pb, id, master, challenge),
  {
    existenceCheck: {
      params: {
        id: "passwords_entries",
      },
    },
  },
);

export const deleteEntry = forgeController(
  {
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  },
  async ({ pb, params: { id } }) => await EntriesService.deleteEntry(pb, id),
  {
    existenceCheck: {
      params: {
        id: "passwords_entries",
      },
    },
    statusCode: 204,
  },
);

export const togglePin = forgeController(
  {
    params: z.object({
      id: z.string(),
    }),
    response: WithPBSchema(PasswordEntrySchema),
  },
  async ({ pb, params: { id } }) => await EntriesService.togglePin(pb, id),
  {
    existenceCheck: {
      params: {
        id: "passwords_entries",
      },
    },
  },
);
