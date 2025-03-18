import PocketBase from "pocketbase";
import { ITodoPriority } from "../typescript/todo_list_interfaces";

export const getAllPriorities = async (
  pb: PocketBase,
): Promise<ITodoPriority[]> => {
  const priorities: ITodoPriority[] = await pb
    .collection("todo_priorities")
    .getFullList();
  return priorities;
};

export const createPriority = async (
  pb: PocketBase,
  data: { name: string; color: string },
): Promise<ITodoPriority> => {
  const priority: ITodoPriority = await pb
    .collection("todo_priorities")
    .create({
      name: data.name,
      color: data.color,
    });
  return priority;
};

export const updatePriority = async (
  pb: PocketBase,
  id: string,
  data: { name: string; color: string },
): Promise<ITodoPriority> => {
  const priority: ITodoPriority = await pb
    .collection("todo_priorities")
    .update(id, {
      name: data.name,
      color: data.color,
    });
  return priority;
};

export const deletePriority = async (
  pb: PocketBase,
  id: string,
): Promise<void> => {
  await pb.collection("todo_priorities").delete(id);
};
