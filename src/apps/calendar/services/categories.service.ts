import PocketBase from "pocketbase";

import { WithPB } from "@typescript/pocketbase_interfaces";

import { ICalendarCategory } from "../typescript/calendar_interfaces";

export const getAllCategories = (
  pb: PocketBase,
): Promise<WithPB<ICalendarCategory>[]> =>
  pb
    .collection("calendar_categories_with_amount")
    .getFullList<WithPB<ICalendarCategory>>({
      sort: "+name",
    });

export const createCategory = async (
  pb: PocketBase,
  categoryData: Omit<ICalendarCategory, "amount">,
): Promise<WithPB<ICalendarCategory>> => {
  const createdEntry = await pb
    .collection("calendar_categories")
    .create<WithPB<Omit<ICalendarCategory, "amount">>>(categoryData);

  return await pb
    .collection("calendar_categories_with_amount")
    .getOne<WithPB<ICalendarCategory>>(createdEntry.id);
};

export const updateCategory = async (
  pb: PocketBase,
  id: string,
  categoryData: Omit<ICalendarCategory, "amount">,
): Promise<WithPB<ICalendarCategory>> => {
  const updatedEntry = await pb
    .collection("calendar_categories")
    .update<WithPB<Omit<ICalendarCategory, "amount">>>(id, categoryData);

  return await pb
    .collection("calendar_categories_with_amount")
    .getOne<WithPB<ICalendarCategory>>(updatedEntry.id);
};

export const deleteCategory = async (pb: PocketBase, id: string) => {
  await pb.collection("calendar_categories").delete(id);
};

export const getCategoryById = (
  pb: PocketBase,
  id: string,
): Promise<WithPB<ICalendarCategory>> =>
  pb.collection("calendar_categories").getOne<WithPB<ICalendarCategory>>(id);
