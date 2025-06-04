import { z } from "zod/v4";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import ClientError from "@utils/ClientError";
import { zodHandler } from "@utils/asyncWrapper";

import * as CategoriesService from "../services/categories.service";
import { CalendarCategorySchema } from "../typescript/calendar_interfaces";

export const getAllCategories = zodHandler(
  {
    response: z.array(WithPBSchema(CalendarCategorySchema)),
  },
  async ({ pb }) => await CategoriesService.getAllCategories(pb),
);

export const getCategoryById = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: WithPBSchema(CalendarCategorySchema),
  },
  async ({ pb, params: { id } }) =>
    await CategoriesService.getCategoryById(pb, id),
  {
    existenceCheck: {
      params: {
        id: "calendar_categories",
      },
    },
  },
);

export const createCategory = zodHandler(
  {
    body: CalendarCategorySchema.omit({
      amount: true,
    }),
    response: WithPBSchema(CalendarCategorySchema),
  },
  async ({ pb, body }) => {
    if (body.name.startsWith("_")) {
      throw new ClientError("Category name cannot start with _");
    }

    if (
      await pb
        .collection("calendar_categories")
        .getFirstListItem(`name="${body.name}"`)
        .catch(() => null)
    ) {
      throw new ClientError("Category with this name already exists");
    }

    return await CategoriesService.createCategory(pb, body);
  },
);

export const updateCategory = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    body: CalendarCategorySchema.omit({
      amount: true,
    }),
    response: WithPBSchema(CalendarCategorySchema),
  },
  async ({ pb, params: { id }, body }) => {
    if (body.name.startsWith("_")) {
      throw new ClientError("Category name cannot start with _");
    }

    if (
      await pb
        .collection("calendar_categories")
        .getFirstListItem(`name="${body.name}" && id != "${id}"`)
        .catch(() => null)
    ) {
      throw new ClientError("Category with this name already exists");
    }

    return await CategoriesService.updateCategory(pb, id, body);
  },
  {
    existenceCheck: {
      params: {
        id: "calendar_categories",
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
        id: "calendar_categories",
      },
    },
    statusCode: 204,
  },
);
