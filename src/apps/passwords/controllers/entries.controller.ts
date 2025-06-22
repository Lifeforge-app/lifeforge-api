import {
  bulkRegisterControllers,
  forgeController,
} from "@functions/newForgeController";
import express from "express";
import { v4 } from "uuid";
import { z } from "zod/v4";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import * as EntriesService from "../services/entries.service";
import { PasswordEntrySchema } from "../typescript/password_interfaces";

const passwordsEntriesRouter = express.Router();

export let challenge = v4();

setTimeout(() => {
  challenge = v4();
}, 1000 * 60);

const getChallenge = forgeController
  .route("GET /challenge")
  .description("Get current challenge for password operations")
  .schema({
    response: z.string(),
  })
  .callback(async () => challenge);

const getAllEntries = forgeController
  .route("GET /")
  .description("Get all password entries")
  .schema({
    response: z.array(WithPBSchema(PasswordEntrySchema)),
  })
  .callback(async ({ pb }) => await EntriesService.getAllEntries(pb));

const createEntry = forgeController
  .route("POST /")
  .description("Create a new password entry")
  .schema({
    body: PasswordEntrySchema.omit({
      decrypted: true,
      pinned: true,
    }).extend({
      master: z.string(),
    }),
    response: WithPBSchema(PasswordEntrySchema),
  })
  .callback(
    async ({ pb, body }) =>
      await EntriesService.createEntry(pb, body, challenge),
  )
  .statusCode(201);

const updateEntry = forgeController
  .route("PATCH /:id")
  .description("Update a password entry")
  .schema({
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
  })
  .existenceCheck("params", {
    id: "passwords_entries",
  })
  .callback(
    async ({ pb, params: { id }, body }) =>
      await EntriesService.updateEntry(pb, id, body, challenge),
  );

const decryptEntry = forgeController
  .route("POST /decrypt/:id")
  .description("Decrypt a password entry")
  .schema({
    params: z.object({
      id: z.string(),
    }),
    query: z.object({
      master: z.string(),
    }),
    response: z.string(),
  })
  .existenceCheck("params", {
    id: "passwords_entries",
  })
  .callback(
    async ({ pb, params: { id }, query: { master } }) =>
      await EntriesService.decryptEntry(pb, id, master, challenge),
  );

const deleteEntry = forgeController
  .route("DELETE /:id")
  .description("Delete a password entry")
  .schema({
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  })
  .existenceCheck("params", {
    id: "passwords_entries",
  })
  .callback(
    async ({ pb, params: { id } }) => await EntriesService.deleteEntry(pb, id),
  )
  .statusCode(204);

const togglePin = forgeController
  .route("POST /pin/:id")
  .description("Toggle pin status of a password entry")
  .schema({
    params: z.object({
      id: z.string(),
    }),
    response: WithPBSchema(PasswordEntrySchema),
  })
  .existenceCheck("params", {
    id: "passwords_entries",
  })
  .callback(
    async ({ pb, params: { id } }) => await EntriesService.togglePin(pb, id),
  );

bulkRegisterControllers(passwordsEntriesRouter, [
  getChallenge,
  getAllEntries,
  createEntry,
  updateEntry,
  decryptEntry,
  deleteEntry,
  togglePin,
]);

export default passwordsEntriesRouter;
