import { z } from "zod/v4";

const AchievementsEntrySchema = z.object({
  title: z.string().min(1).max(100).trim(),
  thoughts: z.string().min(0).max(500).trim(),
  difficulty: z.enum(["easy", "medium", "hard", "impossible"]),
});

type IAchievementEntry = z.infer<typeof AchievementsEntrySchema>;

export { AchievementsEntrySchema };
export type { IAchievementEntry };
