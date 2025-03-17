import PocketBase from "pocketbase";
import { WithoutPBDefault } from "../../../core/typescript/pocketbase_interfaces";
import { ICalendarCategory } from "../typescript/calendar_interfaces";

export const getAllCategories = async (
  pb: PocketBase,
): Promise<ICalendarCategory[]> => {
  return await pb
    .collection("calendar_categories")
    .getFullList<ICalendarCategory>({
      sort: "+name",
    });
};

export const createCategory = async (
  pb: PocketBase,
  categoryData: WithoutPBDefault<ICalendarCategory>,
): Promise<ICalendarCategory> => {
  return await pb
    .collection("calendar_categories")
    .create<ICalendarCategory>(categoryData);
};

export const updateCategory = async (
  pb: PocketBase,
  id: string,
  categoryData: WithoutPBDefault<ICalendarCategory>,
): Promise<ICalendarCategory> => {
  return await pb
    .collection("calendar_categories")
    .update<ICalendarCategory>(id, categoryData);
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
