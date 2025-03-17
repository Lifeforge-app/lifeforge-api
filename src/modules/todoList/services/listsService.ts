import PocketBase from "pocketbase";
import { ITodoListList } from "../../../interfaces/todo_list_interfaces";

/**
 * Get all todo lists
 */
export const getAllLists = async (pb: PocketBase): Promise<ITodoListList[]> => {
  try {
    const lists: ITodoListList[] = await pb
      .collection("todo_lists")
      .getFullList();
    return lists;
  } catch (error) {
    throw error;
  }
};

/**
 * Create a new todo list
 */
export const createList = async (
  pb: PocketBase,
  data: { name: string; icon: string; color: string },
): Promise<ITodoListList> => {
  try {
    const list: ITodoListList = await pb.collection("todo_lists").create({
      name: data.name,
      icon: data.icon,
      color: data.color,
    });
    return list;
  } catch (error) {
    throw error;
  }
};

/**
 * Update a todo list
 */
export const updateList = async (
  pb: PocketBase,
  id: string,
  data: { name: string; icon: string; color: string },
): Promise<ITodoListList> => {
  try {
    const list: ITodoListList = await pb.collection("todo_lists").update(id, {
      name: data.name,
      icon: data.icon,
      color: data.color,
    });
    return list;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a todo list
 */
export const deleteList = async (pb: PocketBase, id: string): Promise<void> => {
  try {
    await pb.collection("todo_lists").delete(id);
  } catch (error) {
    throw error;
  }
};
