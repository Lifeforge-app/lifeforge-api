// This file is auto-generated. DO NOT EDIT IT MANUALLY.
// Generated for module: music
// Generated at: 2025-07-09T11:52:26.853Z
// Contains: music__entries
import { z } from "zod/v4";

const MusicEntriesSchema = z.object({
  name: z.string(),
  duration: z.string(),
  author: z.string(),
  file: z.string(),
  is_favourite: z.boolean(),
});

type IMusicEntries = z.infer<typeof MusicEntriesSchema>;

export { MusicEntriesSchema };

export type { IMusicEntries };
