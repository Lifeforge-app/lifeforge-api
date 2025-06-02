import { z } from "zod";

import { WithPBSchema } from "@typescript/pocketbase_interfaces";

import { checkExistence } from "@utils/PBRecordValidator";
import { zodHandler } from "@utils/asyncWrapper";
import { clientError, successWithBaseResponse } from "@utils/response";

import * as CategoriesService from "../services/categories.service";
import { CalendarCategorySchema } from "../typescript/calendar_interfaces";

export const getAllCategories = zodHandler(
  {
    response: z.array(WithPBSchema(CalendarCategorySchema)),
  },
  async (req, res) => {
    const { pb } = req;

    const categories = await CategoriesService.getAllCategories(pb);

    successWithBaseResponse(res, categories);
  },
);

export const getCategoryById = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: WithPBSchema(CalendarCategorySchema),
  },
  async (req, res) => {
    const { pb } = req;
    const { id } = req.params;

    if (!(await checkExistence(req, res, "calendar_categories", id))) {
      return;
    }

    const category = await CategoriesService.getCategoryById(pb, id);

    successWithBaseResponse(res, category);
  },
);

export const createCategory = zodHandler(
  {
    body: CalendarCategorySchema.omit({
      amount: true,
    }),
    response: WithPBSchema(CalendarCategorySchema),
  },
  async (req, res) => {
    const { pb } = req;
    const categoryData = req.body;

    if (categoryData.name.startsWith("_")) {
      return clientError(res, "Category name cannot start with _");
    }

    if (
      await pb
        .collection("calendar_categories")
        .getFirstListItem(`name="${categoryData.name}"`)
        .catch(() => null)
    ) {
      return clientError(res, "Category with this name already exists");
    }

    const category = await CategoriesService.createCategory(pb, categoryData);

    successWithBaseResponse(res, category, 201);
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
  async (req, res) => {
    const { pb } = req;
    const { id } = req.params;
    const categoryData = req.body;

    if (categoryData.name.startsWith("_")) {
      return clientError(res, "Category name cannot start with _");
    }

    if (!(await checkExistence(req, res, "calendar_categories", id))) {
      return;
    }

    if (
      await pb
        .collection("calendar_categories")
        .getFirstListItem(`name="${categoryData.name}" && id != "${id}"`)
        .catch(() => null)
    ) {
      return clientError(res, "Category with this name already exists");
    }

    const category = await CategoriesService.updateCategory(
      pb,
      id,
      categoryData,
    );

    successWithBaseResponse(res, category);
  },
);

export const deleteCategory = zodHandler(
  {
    params: z.object({
      id: z.string(),
    }),
    response: z.void(),
  },
  async (req, res) => {
    const { pb } = req;
    const { id } = req.params;

    if (!(await checkExistence(req, res, "calendar_categories", id))) {
      return;
    }

    await CategoriesService.deleteCategory(pb, id);

    successWithBaseResponse(res, undefined, 204);
  },
);
