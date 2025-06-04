import { z } from "zod/v4";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import { zodHandler } from "@utils/asyncWrapper";

import * as CategoriesService from "../services/categories.service";
import { WalletCategorySchema } from "../typescript/wallet_interfaces";

export const getAllCategories = zodHandler(
  {
    response: z.array(WithPBSchema(WalletCategorySchema)),
  },
  async ({ pb }) => await CategoriesService.getAllCategories(pb),
);

export const createCategory = zodHandler(
  {
    body: WalletCategorySchema.omit({
      amount: true,
    }),
    response: WithPBSchema(WalletCategorySchema),
  },
  async ({ pb, body }) => await CategoriesService.createCategory(pb, body),
  {
    statusCode: 201,
  },
);

export const updateCategory = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    body: WalletCategorySchema.omit({
      amount: true,
    }),
    response: WithPBSchema(WalletCategorySchema),
  },
  async ({ pb, params: { id }, body }) =>
    await CategoriesService.updateCategory(pb, id, body),
  {
    existenceCheck: {
      params: {
        id: "wallet_categories",
      },
    },
  },
);

export const deleteCategory = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  },
  async ({ pb, params: { id } }) =>
    await CategoriesService.deleteCategory(pb, id),
  {
    existenceCheck: {
      params: {
        id: "wallet_categories",
      },
    },
    statusCode: 204,
  },
);
