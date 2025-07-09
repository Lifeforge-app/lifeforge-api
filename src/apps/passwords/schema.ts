import { z } from "zod/v4";

const PasswordEntrySchema = z.object({
  color: z.string(),
  icon: z.string(),
  name: z.string(),
  password: z.string(),
  username: z.string(),
  website: z.string(),
  decrypted: z.string().optional(),
  pinned: z.boolean(),
});

type IPasswordEntry = z.infer<typeof PasswordEntrySchema>;

export type { IPasswordEntry };

export { PasswordEntrySchema };
