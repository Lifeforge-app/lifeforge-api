// This file is auto-generated. DO NOT EDIT IT MANUALLY.
// Generated for module: momentVault
// Generated at: 2025-07-09T11:52:26.853Z
// Contains: moment_vault__entries
import { z } from "zod/v4";

const MomentVaultEntriesSchema = z.object({
  type: z.enum(["text", "audio", "video", "photos"]),
  file: z.string(),
  content: z.string(),
  transcription: z.string(),
});

type IMomentVaultEntries = z.infer<typeof MomentVaultEntriesSchema>;

export { MomentVaultEntriesSchema };

export type { IMomentVaultEntries };
