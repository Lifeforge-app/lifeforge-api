import Pocketbase from "pocketbase";

import { IAchievementEntry } from "../typescript/achievements_interfaces";

export const getAllEntriesByDifficulty = async (
  pb: Pocketbase,
  difficulty: "easy" | "medium" | "hard" | "impossible",
): Promise => {
  return pb.collection("achievements_entries").getFullList<IAchievementEntry>({
    filter: `difficulty = "${difficulty}"`,
  });
};

export const createEntry = async (pb: Pocketbase, data: Pick): Promise => {
  const { difficulty, title, thoughts } = data;

  return pb.collection("achievements_entries").create<IAchievementEntry>({
    difficulty,
    title,
    thoughts,
  });
};

export const updateEntry = async (
  pb: Pocketbase,
  id: string,
  data: Pick,
): Promise => {
  const { difficulty, title, thoughts } = data;

  return pb.collection("achievements_entries").update<IAchievementEntry>(id, {
    difficulty,
    title,
    thoughts,
  });
};

export const deleteEntry = async (pb: Pocketbase, id: string): Promise => {
  return pb.collection("achievements_entries").delete(id);
};
