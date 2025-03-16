import PocketBase from "pocketbase";
import { ICalendarCategory } from "../../../interfaces/calendar_interfaces";
import { WithoutPBDefault } from "../../../interfaces/pocketbase_interfaces";

/**
 * Fetch all calendar categories
 */
export const getAllCategories = async (
  pb: PocketBase,
): Promise<ICalendarCategory[]> => {
  return await pb
    .collection("calendar_categories")
    .getFullList<ICalendarCategory>({
      sort: "+name",
    });
};

/**
 * Create a new calendar category
 */
export const createCategory = async (
  pb: PocketBase,
  categoryData: WithoutPBDefault<ICalendarCategory>,
): Promise<ICalendarCategory> => {
  return await pb
    .collection("calendar_categories")
    .create<ICalendarCategory>(categoryData);
};

/**
 * Update an existing calendar category
 */
export const updateCategory = async (
  pb: PocketBase,
  id: string,
  categoryData: WithoutPBDefault<ICalendarCategory>,
): Promise<ICalendarCategory> => {
  return await pb
    .collection("calendar_categories")
    .update<ICalendarCategory>(id, categoryData);
};

/**
 * Delete a calendar category
 */
export const deleteCategory = async (
  pb: PocketBase,
  id: string,
): Promise<boolean> => {
  return await pb.collection("calendar_categories").delete(id);
};

/**
 * Get a single calendar category by ID
 */
export const getCategoryById = async (
  pb: PocketBase,
  id: string,
): Promise<ICalendarCategory> => {
  return await pb
    .collection("calendar_categories")
    .getOne<ICalendarCategory>(id);
};
