import { z } from "zod";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import { zodHandler } from "@utils/asyncWrapper";

import * as LedgersService from "../services/ledgers.service";
import { WalletLedgerSchema } from "../typescript/wallet_interfaces";

export const getAllLedgers = zodHandler(
  {
    response: z.array(WithPBSchema(WalletLedgerSchema)),
  },
  async ({ pb }) => await LedgersService.getAllLedgers(pb),
);

export const createLedger = zodHandler(
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

export const updateLedger = zodHandler(
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

export const deleteLedger = zodHandler(
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
