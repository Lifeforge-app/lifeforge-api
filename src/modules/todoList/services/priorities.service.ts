import PocketBase from "pocketbase";
import { ITodoPriority } from "../typescript/todo_list_interfaces";

/**
 * Get all todo priorities
 */
export const getAllPriorities = async (
  pb: PocketBase,
): Promise<ITodoPriority[]> => {
  try {
    const priorities: ITodoPriority[] = await pb
      .collection("todo_priorities")
      .getFullList();
    return priorities;
  } catch (error) {
    throw error;
  }
};

/**
 * Create a new todo priority
 */
export const createPriority = async (
  pb: PocketBase,
  data: { name: string; color: string },
): Promise<ITodoPriority> => {
  try {
    const priority: ITodoPriority = await pb
      .collection("todo_priorities")
      .create({
        name: data.name,
        color: data.color,
      });
    return priority;
  } catch (error) {
    throw error;
  }
};

/**
 * Update a todo priority
 */
export const updatePriority = async (
  pb: PocketBase,
  id: string,
  data: { name: string; color: string },
): Promise<ITodoPriority> => {
  try {
    const priority: ITodoPriority = await pb
      .collection("todo_priorities")
      .update(id, {
        name: data.name,
        color: data.color,
      });
    return priority;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a todo priority
 */
export const deletePriority = async (
  pb: PocketBase,
  id: string,
): Promise<void> => {
  try {
    await pb.collection("todo_priorities").delete(id);
  } catch (error) {
    throw error;
  }
};
