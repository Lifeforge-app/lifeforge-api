import * as s from "superstruct";
import { BasePBCollectionSchema } from "./pocketbase_interfaces";

const MomentVaultEntrySchema = s.assign(
  BasePBCollectionSchema,
  s.object({
    type: s.union([
      s.literal("text"),
      s.literal("audio"),
      s.literal("video"),
      s.literal("photo"),
    ]),
    content: s.string(),
    file: s.optional(s.string()),
    transcript: s.optional(s.string()),
  }),
);

type IMomentVaultEntry = s.Infer<typeof MomentVaultEntrySchema>;

export { MomentVaultEntrySchema };

export type { IMomentVaultEntry };
