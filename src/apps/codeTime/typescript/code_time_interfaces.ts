import { z } from "zod/v4";

const CodeTimeDailyEntrySchema = z.object({
  date: z.string(),
  relative_files: z.record(z.string(), z.number()),
  projects: z.record(z.string(), z.number()),
  total_minutes: z.number(),
  last_timestamp: z.number(),
  languages: z.record(z.string(), z.number()),
});

const CodeTimeActivitiesSchema = z.object({
  data: z.array(
    z.object({
      date: z.string(),
      count: z.number(),
      level: z.number(),
    }),
  ),
  firstYear: z.number(),
});

const CodeTimeStatisticsSchema = z.object({
  "Most time spent": z.number(),
  "Total time spent": z.number(),
  "Average time spent": z.number(),
  "Longest streak": z.number(),
  "Current streak": z.number(),
});

type ICodeTimeActivities = z.infer<typeof CodeTimeActivitiesSchema>;
type ICodeTimeDailyEntry = z.infer<typeof CodeTimeDailyEntrySchema>;
type ICodeTimeStatistics = z.infer<typeof CodeTimeStatisticsSchema>;

export type { ICodeTimeActivities, ICodeTimeDailyEntry, ICodeTimeStatistics };

export {
  CodeTimeActivitiesSchema,
  CodeTimeDailyEntrySchema,
  CodeTimeStatisticsSchema,
};
