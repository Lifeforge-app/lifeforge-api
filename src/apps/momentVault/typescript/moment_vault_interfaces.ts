import { z } from "zod";

const MomentVaultEntrySchema = z.object({
  type: z.enum(["text", "audio", "video", "photos"]),
  content: z.string().optional(),
  file: z.array(z.string()).optional(),
  transcription: z.string().optional(),
});

type IMomentVaultEntry = z.infer<typeof MomentVaultEntrySchema>;

export type { IMomentVaultEntry };

export { MomentVaultEntrySchema };
