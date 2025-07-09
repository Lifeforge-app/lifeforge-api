import PocketBase from "pocketbase";

import { WithPB } from "@typescript/pocketbase_interfaces";

import { ITodoListPriority } from "../typescript/todo_list_interfaces";

export const getAllPriorities = (
  pb: PocketBase,
): Promise<
  WithPB<
    ITodoListPriority & {
      amount: number;
    }
  >[]
> =>
  pb.collection("todo_list_priorities_aggregated").getFullList<
    WithPB<
      ITodoListPriority & {
        amount: number;
      }
    >
  >();

export const createPriority = async (
  pb: PocketBase,
  data: ITodoListPriority,
): Promise<
  WithPB<
    ITodoListPriority & {
      amount: number;
    }
  >
> => {
  const created = await pb
    .collection("todo_list_priorities")
    .create<WithPB<ITodoListPriority>>(data);

  return pb
    .collection("todo_list_priorities_aggregated")
    .getOne<WithPB<ITodoListPriority & { amount: number }>>(created.id);
};

export const updatePriority = async (
  pb: PocketBase,
  id: string,
  data: ITodoListPriority,
): Promise<
  WithPB<
    ITodoListPriority & {
      amount: number;
    }
  >
> => {
  const updated = await pb
    .collection("todo_list_priorities")
    .update<WithPB<ITodoListPriority>>(id, data);

  return pb
    .collection("todo_list_priorities_aggregated")
    .getOne<WithPB<ITodoListPriority & { amount: number }>>(updated.id);
};

export const deletePriority = async (
  pb: PocketBase,
  id: string,
): Promise<void> => {
  await pb.collection("todo_list_priorities").delete(id);
};
