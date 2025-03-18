import PocketBase from "pocketbase";
import { ITodoListTag } from "../typescript/todo_list_interfaces";

export const getAllTags = async (pb: PocketBase): Promise<ITodoListTag[]> => {
  const tags: ITodoListTag[] = await pb.collection("todo_tags").getFullList();
  return tags;
};

export const createTag = async (
  pb: PocketBase,
  data: { name: string },
): Promise<ITodoListTag> => {
  const tag: ITodoListTag = await pb.collection("todo_tags").create({
    name: data.name,
  });
  return tag;
};

export const updateTag = async (
  pb: PocketBase,
  id: string,
  data: { name: string },
): Promise<ITodoListTag> => {
  const tag: ITodoListTag = await pb.collection("todo_tags").update(id, {
    name: data.name,
  });
  return tag;
};

export const deleteTag = async (pb: PocketBase, id: string): Promise<void> => {
  await pb.collection("todo_tags").delete(id);
};
