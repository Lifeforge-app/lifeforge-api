import Pocketbase from "pocketbase";

import { WithPB } from "@typescript/pocketbase_interfaces";

import { IAchievementEntry } from "../typescript/achievements_interfaces";

export const getAllEntriesByDifficulty = async (
  pb: Pocketbase,
  difficulty: "easy" | "medium" | "hard" | "impossible",
) => {
  return pb
    .collection("achievements_entries")
    .getFullList<WithPB<IAchievementEntry>>({
      filter: `difficulty = "${difficulty}"`,
    });
};

export const createEntry = async (
  pb: Pocketbase,
  data: Pick<IAchievementEntry, "difficulty" | "title" | "thoughts">,
) => {
  const { difficulty, title, thoughts } = data;

  return pb
    .collection("achievements_entries")
    .create<WithPB<IAchievementEntry>>({
      difficulty,
      title,
      thoughts,
    });
};

export const updateEntry = async (
  pb: Pocketbase,
  id: string,
  data: Pick<IAchievementEntry, "difficulty" | "title" | "thoughts">,
) => {
  const { difficulty, title, thoughts } = data;

  return pb
    .collection("achievements_entries")
    .update<WithPB<IAchievementEntry>>(id, {
      difficulty,
      title,
      thoughts,
    });
};

export const deleteEntry = async (pb: Pocketbase, id: string) => {
  pb.collection("achievements_entries").delete(id);
};
