import PocketBase from "pocketbase";
import { ITodoListTag } from "../typescript/todo_list_interfaces";

/**
 * Get all todo tags
 */
export const getAllTags = async (pb: PocketBase): Promise<ITodoListTag[]> => {
  try {
    const tags: ITodoListTag[] = await pb.collection("todo_tags").getFullList();
    return tags;
  } catch (error) {
    throw error;
  }
};

/**
 * Create a new todo tag
 */
export const createTag = async (
  pb: PocketBase,
  data: { name: string },
): Promise<ITodoListTag> => {
  try {
    const tag: ITodoListTag = await pb.collection("todo_tags").create({
      name: data.name,
    });
    return tag;
  } catch (error) {
    throw error;
  }
};

/**
 * Update a todo tag
 */
export const updateTag = async (
  pb: PocketBase,
  id: string,
  data: { name: string },
): Promise<ITodoListTag> => {
  try {
    const tag: ITodoListTag = await pb.collection("todo_tags").update(id, {
      name: data.name,
    });
    return tag;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a todo tag
 */
export const deleteTag = async (pb: PocketBase, id: string): Promise<void> => {
  try {
    await pb.collection("todo_tags").delete(id);
  } catch (error) {
    throw error;
  }
};
