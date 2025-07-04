import {
  bulkRegisterControllers,
  forgeController,
} from "@functions/forgeController";
import express from "express";
import { z } from "zod/v4";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import * as CategoriesService from "../services/categories.service";
import { WalletCategorySchema } from "../typescript/wallet_interfaces";

const walletCategoriesRouter = express.Router();

const getAllCategories = forgeController
  .route("GET /")
  .description("Get all wallet categories")
  .schema({
    response: z.array(WithPBSchema(WalletCategorySchema)),
  })
  .callback(async ({ pb }) => await CategoriesService.getAllCategories(pb));

const createCategory = forgeController
  .route("POST /")
  .description("Create a new wallet category")
  .schema({
    body: WalletCategorySchema.omit({
      amount: true,
    }),
    response: WithPBSchema(WalletCategorySchema),
  })
  .statusCode(201)
  .callback(
    async ({ pb, body }) => await CategoriesService.createCategory(pb, body),
  );

const updateCategory = forgeController
  .route("PATCH /:id")
  .description("Update an existing wallet category")
  .schema({
    params: z.object({
      id: z.string(),
    }),
    body: WalletCategorySchema.omit({
      amount: true,
    }),
    response: WithPBSchema(WalletCategorySchema),
  })
  .existenceCheck("params", {
    id: "wallet_categories",
  })
  .callback(
    async ({ pb, params: { id }, body }) =>
      await CategoriesService.updateCategory(pb, id, body),
  );

const deleteCategory = forgeController
  .route("DELETE /:id")
  .description("Delete a wallet category")
  .schema({
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  })
  .existenceCheck("params", {
    id: "wallet_categories",
  })
  .statusCode(204)
  .callback(
    async ({ pb, params: { id } }) =>
      await CategoriesService.deleteCategory(pb, id),
  );

bulkRegisterControllers(walletCategoriesRouter, [
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
]);

export default walletCategoriesRouter;
