// This file is auto-generated. DO NOT EDIT IT MANUALLY.
// Generated for module: codeTime
// Generated at: 2025-07-09T11:52:26.854Z
// Contains: code_time__projects, code_time__languages, code_time__daily_entries
import { z } from "zod/v4";

const CodeTimeProjectsSchema = z.object({
  name: z.string(),
  duration: z.number(),
});

const CodeTimeLanguagesSchema = z.object({
  name: z.string(),
  icon: z.string(),
  color: z.string(),
  duration: z.number(),
});

const CodeTimeDailyEntriesSchema = z.object({
  date: z.string(),
  relative_files: z.any(),
  projects: z.any(),
  total_minutes: z.number(),
  last_timestamp: z.number(),
  languages: z.any(),
});

type ICodeTimeProjects = z.infer<typeof CodeTimeProjectsSchema>;
type ICodeTimeLanguages = z.infer<typeof CodeTimeLanguagesSchema>;
type ICodeTimeDailyEntries = z.infer<typeof CodeTimeDailyEntriesSchema>;

export {
  CodeTimeProjectsSchema,
  CodeTimeLanguagesSchema,
  CodeTimeDailyEntriesSchema,
};

export type { ICodeTimeProjects, ICodeTimeLanguages, ICodeTimeDailyEntries };
