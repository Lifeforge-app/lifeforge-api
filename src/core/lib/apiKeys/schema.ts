import { z } from "zod/v4";

const APIKeyEntrySchema = z.object({
  keyId: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  key: z.string(),
});

type IAPIKeyEntry = z.infer<typeof APIKeyEntrySchema>;

export type { IAPIKeyEntry };

export { APIKeyEntrySchema };
