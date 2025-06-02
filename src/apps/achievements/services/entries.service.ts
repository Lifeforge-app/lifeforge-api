import Pocketbase from "pocketbase";

import { WithPB } from "@typescript/pocketbase_interfaces";

import { IAchievementEntry } from "../typescript/achievements_interfaces";

export const getAllEntriesByDifficulty = (
  pb: Pocketbase,
  difficulty: "easy" | "medium" | "hard" | "impossible",
): Promise<WithPB<IAchievementEntry>[]> =>
  pb.collection("achievements_entries").getFullList<WithPB<IAchievementEntry>>({
    filter: `difficulty = "${difficulty}"`,
  });

export const createEntry = (
  pb: Pocketbase,
  {
    difficulty,
    title,
    thoughts,
  }: Pick<IAchievementEntry, "difficulty" | "title" | "thoughts">,
): Promise<WithPB<IAchievementEntry>> =>
  pb.collection("achievements_entries").create<WithPB<IAchievementEntry>>({
    difficulty,
    title,
    thoughts,
  });

export const updateEntry = (
  pb: Pocketbase,
  id: string,
  {
    difficulty,
    title,
    thoughts,
  }: Pick<IAchievementEntry, "difficulty" | "title" | "thoughts">,
): Promise<WithPB<IAchievementEntry>> =>
  pb.collection("achievements_entries").update<WithPB<IAchievementEntry>>(id, {
    difficulty,
    title,
    thoughts,
  });

export const deleteEntry = (pb: Pocketbase, id: string): Promise<boolean> =>
  pb.collection("achievements_entries").delete(id);
