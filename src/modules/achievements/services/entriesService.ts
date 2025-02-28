import Pocketbase from "pocketbase";
import { IAchievementEntry } from "../../../interfaces/achievements_interfaces";

export const getAllEntriesByDifficulty = async (
  pb: Pocketbase,
  difficulty: "easy" | "medium" | "hard" | "impossible"
): Promise<IAchievementEntry[] | void> => {
  return pb
    .collection("achievements_entries")
    .getFullList<IAchievementEntry>({
      filter: `difficulty = "${difficulty}"`,
    })
    .catch((error) => {
      console.error(error);
    });
};

export const createEntry = async (
  pb: Pocketbase,
  data: Pick<IAchievementEntry, "difficulty" | "title" | "thoughts">
): Promise<IAchievementEntry | void> => {
  const { difficulty, title, thoughts } = data;

  return pb
    .collection("achievements_entries")
    .create<IAchievementEntry>({
      difficulty,
      title,
      thoughts,
    })
    .catch((error) => {
      console.error(error);
    });
};

export const updateEntry = async (
  pb: Pocketbase,
  id: string,
  data: Pick<IAchievementEntry, "difficulty" | "title" | "thoughts">
): Promise<IAchievementEntry | void> => {
  const { difficulty, title, thoughts } = data;

  return pb
    .collection("achievements_entries")
    .update<IAchievementEntry>(id, {
      difficulty,
      title,
      thoughts,
    })
    .catch((error) => {
      console.error(error);
    });
};

export const deleteEntry = async (
  pb: Pocketbase,
  id: string
): Promise<boolean | void> => {
  return pb
    .collection("achievements_entries")
    .delete(id)
    .catch((error) => {
      console.error(error);
    });
};
