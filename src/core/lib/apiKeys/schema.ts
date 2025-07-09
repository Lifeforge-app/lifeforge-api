// This file is auto-generated. DO NOT EDIT IT MANUALLY.
// Generated for module: apiKeys
// Generated at: 2025-07-09T11:52:26.855Z
// Contains: api_keys__entries
import { z } from "zod/v4";

const ApiKeysEntriesSchema = z.object({
  keyId: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  key: z.string(),
});

type IApiKeysEntries = z.infer<typeof ApiKeysEntriesSchema>;

export { ApiKeysEntriesSchema };

export type { IApiKeysEntries };
