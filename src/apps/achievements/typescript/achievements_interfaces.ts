import { z } from "zod";

const AchievementsEntrySchema = z.object({
  title: z.string(),
  thoughts: z.string(),
  difficulty: z.enum(["easy", "medium", "hard", "impossible"]),
});

type IAchievementEntry = z.infer<typeof AchievementsEntrySchema>;

export { AchievementsEntrySchema };
export type { IAchievementEntry };
