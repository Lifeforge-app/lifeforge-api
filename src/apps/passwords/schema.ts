// This file is auto-generated. DO NOT EDIT IT MANUALLY.
// Generated for module: passwords
// Generated at: 2025-07-09T11:52:26.853Z
// Contains: passwords__entries
import { z } from "zod/v4";

const PasswordsEntriesSchema = z.object({
  name: z.string(),
  website: z.string(),
  username: z.string(),
  password: z.string(),
  icon: z.string(),
  color: z.string(),
  pinned: z.boolean(),
});

type IPasswordsEntries = z.infer<typeof PasswordsEntriesSchema>;

export { PasswordsEntriesSchema };

export type { IPasswordsEntries };
