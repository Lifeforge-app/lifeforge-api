import PocketBase from "pocketbase";

import { ITodoListList } from "../typescript/todo_list_interfaces";

export const getAllLists = async (pb: PocketBase): Promise<ITodoListList[]> => {
  const lists: ITodoListList[] = await pb
    .collection("todo_lists_with_amount")
    .getFullList();
  return lists;
};

export const createList = async (
  pb: PocketBase,
  data: { name: string; icon: string; color: string },
): Promise<ITodoListList> => {
  const list: ITodoListList = await pb.collection("todo_lists").create({
    name: data.name,
    icon: data.icon,
    color: data.color,
  });
  return list;
};

export const updateList = async (
  pb: PocketBase,
  id: string,
  data: { name: string; icon: string; color: string },
): Promise<ITodoListList> => {
  const list: ITodoListList = await pb.collection("todo_lists").update(id, {
    name: data.name,
    icon: data.icon,
    color: data.color,
  });
  return list;
};

export const deleteList = async (pb: PocketBase, id: string): Promise<void> => {
  await pb.collection("todo_lists").delete(id);
};
