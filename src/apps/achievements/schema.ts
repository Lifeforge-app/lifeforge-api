// This file is auto-generated. DO NOT EDIT IT MANUALLY.
// Generated for module: achievements
// Generated at: 2025-07-09T11:52:26.853Z
// Contains: achievements__entries
import { z } from "zod/v4";

const AchievementsEntriesSchema = z.object({
  title: z.string(),
  thoughts: z.string(),
  difficulty: z.enum(["easy", "medium", "hard", "impossible"]),
});

type IAchievementsEntries = z.infer<typeof AchievementsEntriesSchema>;

export { AchievementsEntriesSchema };

export type { IAchievementsEntries };
