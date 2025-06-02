import { BasePBCollectionSchema } from "@typescript/pocketbase_interfaces.js";
import * as s from "superstruct";

const AchievementsEntrySchema = s.assign(
  BasePBCollectionSchema,
  s.object({
    title: s.string(),
    thoughts: s.string(),
    difficulty: s.union([
      s.literal("easy"),
      s.literal("medium"),
      s.literal("hard"),
      s.literal("impossible"),
    ]),
  }),
);

type IAchievementEntry = s.Infer<typeof AchievementsEntrySchema>;

export { AchievementsEntrySchema };
export type { IAchievementEntry };
