import { forgeController } from "@functions/forgeController";
import { z } from "zod/v4";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import * as LedgersService from "../services/ledgers.service";
import { WalletLedgerSchema } from "../typescript/wallet_interfaces";

export const getAllLedgers = forgeController(
  {
    response: z.array(WithPBSchema(WalletLedgerSchema)),
  },
  async ({ pb }) => await LedgersService.getAllLedgers(pb),
);

export const createLedger = forgeController(
  {
    body: WalletLedgerSchema.omit({
      amount: true,
    }),
    response: WithPBSchema(WalletLedgerSchema),
  },
  async ({ pb, body }) => await LedgersService.createLedger(pb, body),
  {
    statusCode: 201,
  },
);

export const updateLedger = forgeController(
  {
    params: z.object({
      id: z.string(),
    }),
    body: WalletLedgerSchema.omit({
      amount: true,
    }),
    response: WithPBSchema(WalletLedgerSchema),
  },
  async ({ pb, params: { id }, body }) =>
    await LedgersService.updateLedger(pb, id, body),
  {
    existenceCheck: {
      params: {
        id: "wallet_ledgers",
      },
    },
  },
);

export const deleteLedger = forgeController(
  {
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  },
  async ({ pb, params: { id } }) => await LedgersService.deleteLedger(pb, id),
  {
    existenceCheck: {
      params: {
        id: "wallet_ledgers",
      },
    },
    statusCode: 204,
  },
);
