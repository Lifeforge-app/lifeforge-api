import PocketBase from "pocketbase";
import { WithoutPBDefault } from "../../../core/typescript/pocketbase_interfaces";
import { ICalendarCategory } from "../typescript/calendar_interfaces";

export const getAllCategories = async (
  pb: PocketBase,
): Promise<ICalendarCategory[]> => {
  return await pb
    .collection("calendar_categories_with_amount")
    .getFullList<ICalendarCategory>({
      sort: "+name",
    });
};

export const createCategory = async (
  pb: PocketBase,
  categoryData: WithoutPBDefault<ICalendarCategory>,
): Promise<ICalendarCategory> => {
  const createdEntry = await pb
    .collection("calendar_categories")
    .create<ICalendarCategory>(categoryData);

  return await pb
    .collection("calendar_categories_with_amount")
    .getOne<ICalendarCategory>(createdEntry.id);
};

export const updateCategory = async (
  pb: PocketBase,
  id: string,
  categoryData: WithoutPBDefault<ICalendarCategory>,
): Promise<ICalendarCategory> => {
  const updatedEntry = await pb
    .collection("calendar_categories")
    .update<ICalendarCategory>(id, categoryData);

  return await pb
    .collection("calendar_categories_with_amount")
    .getOne<ICalendarCategory>(updatedEntry.id);
};

export const deleteCategory = async (
  pb: PocketBase,
  id: string,
): Promise<boolean> => {
  return await pb.collection("calendar_categories").delete(id);
};

export const getCategoryById = async (
  pb: PocketBase,
  id: string,
): Promise<ICalendarCategory> => {
  return await pb
    .collection("calendar_categories")
    .getOne<ICalendarCategory>(id);
};
