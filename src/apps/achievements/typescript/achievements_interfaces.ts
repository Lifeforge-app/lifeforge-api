import * as s from "superstruct";

import { BasePBCollectionSchema } from "@typescript/pocketbase_interfaces.js";

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

type IAchievementEntry = s.Infer;

export { AchievementsEntrySchema };
export type { IAchievementEntry };
